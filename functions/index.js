/* eslint-disable no-undef */
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const Mailgun = require("mailgun.js").default;
const FormData = require("form-data");
const { MAILGUN_API_KEY } = process.env;
const COLLECTION = "rsvps";

initializeApp();
const db = getFirestore();
const rsvpCollection = db.collection(COLLECTION);

exports.addRSVP = onCall(async (request) => {
  const { id, ...data } = request.data;

  try {
    if (id) {
      await rsvpCollection.doc(id).update({ ...data, lastUpdated: new Date() });
      return { message: "RSVP updated successfully", id };
    }

    // Check for duplicate email
    const querySnapshot = await rsvpCollection
      .where("email", "==", data.email)
      .get();
    if (!querySnapshot.empty) {
      throw new HttpsError("already-exists", "Email already exists");
    }

    // Add new RSVP
    const docRef = await rsvpCollection.add({ ...data, timestamp: new Date() });
    return { message: "RSVP added successfully", id: docRef.id };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error processing RSVP", error.message);
  }
});

async function sendEmail(guestData, docId, subject, body, update) {
  const mailgun = new Mailgun(FormData);
  if (!MAILGUN_API_KEY) {
    throw new HttpsError("internal", "API key is not defined");
  }
  const mg = mailgun.client({
    username: "api",
    key: MAILGUN_API_KEY,
  });

  const { email, firstName, lastName = "", questionnaireAnswers } = guestData;

  try {
    const data = await mg.messages.create("para-siempre.love", {
      from: "Jun ❤️ Leslie <no-reply@para-siempre.love>",
      to: [`${firstName} ${lastName} <${email}>`],
      subject,
      html: `<html>
          <head>
            <style>
              body { font-family: sans-serif; }
              .container { padding: 20px; border: 1px solid #eee; }
              h1 { color: #333; }
              h3 {font-size: 1.2rem}
              p {font-size: font-size: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Thank You for Your RSVP, ${firstName}!</h1>
              <p>Hi ${firstName} ${lastName},</p>
              <p>${body}</p>
              <h3>When: May 11th Sunday at 2pm</h3>
              <h3>Where: 9850 64th St W, University Place, WA 98467, United States</h3>
              <p><b>Your RSVP information:</b></p>
              <p>First name: ${firstName}</p>
              <p>Last name: ${lastName || "N/A"}</p>
              ${Object.entries(questionnaireAnswers || {})
                .map(([key, answer]) => {
                  const qInfo = require("./questionnaireFlow.json")[key];
                  return qInfo ? `<p>${qInfo.question}: ${answer}</p>` : "";
                })
                .filter((line) => line)
                .join("\n    ")}
              <p>Need to make changes? Please contact Jun & Leslie directly.</p>
              <p>More information at <a href="https://www.para-siempre.love">para-siempre.love</a></p>
              <p>Warmly,</p>
              <p>Jun ❤️ Leslie</p>
            </div>
          </body>
        </html>`,
    });
    update && (await rsvpCollection.doc(docId).update(update));
    return { success: true, data };
  } catch (error) {
    throw new HttpsError("internal", "Failed to send email: " + error.message);
  }
}

async function sendReminderEmailToAll() {
  const snapshot = await rsvpCollection.get();
  snapshot.forEach((doc) => {
    const body = `
      Just a friendly reminder about Jun ❤️ Leslie's wedding! Our wedding is 1 week from now!
    `;
    sendEmail(doc, doc.id, "Hope to see you there!", body, {
      reminderSent: true,
    });
  });
}

exports.sendReminderEmail = onCall(sendReminderEmailToAll);

exports.sendConfirmationEmail = onCall(async (request) =>
  sendEmail(
    request.data,
    request.data.id,
    "Thank you for RSVP",
    "We've received your RSVP for our wedding. We're so excited to celebrate with you!",
    { confirmationEmailSent: true },
  ),
);

// Trigger for new RSVP creation
exports.sendConfirmationEmailOnCreate = onDocumentCreated(
  `${COLLECTION}/{id}`,
  async (event) => {
    const guestData = event.data.data();
    const docId = event.data.id;
    if (guestData.confirmationEmailSent) {
      console.log(`confirmation email already sent ${guestData.email}`);
      return;
    }
    return sendEmail(
      guestData,
      docId,
      "Thank you for RSVP",
      "We've received your RSVP for our wedding. We're so excited to celebrate with you!",
      { confirmationEmailSent: true },
    );
  },
);

// Trigger for RSVP updates
// module.exports.sendConfirmationEmailOnUpdate = onDocumentUpdated(
//   "rsvps/{id}",
//   async (event) => {
//     const guestData = event.data.after.data();
//     const docId = event.data.after.id;
//     return sendEmail(guestData, docId);
//   },
// );
