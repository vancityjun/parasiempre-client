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

async function sendEmail(guestData, docId) {
  const mailgun = new Mailgun(FormData);
  if (!MAILGUN_API_KEY) {
    throw new HttpsError("internal", "API key is not defined");
  }
  const mg = mailgun.client({
    username: "api",
    key: MAILGUN_API_KEY,
  });

  const { email, firstName, lastName, answers } = guestData;
  try {
    const data = await mg.messages.create("para-siempre.love", {
      from: "Jun & Leslie <no-reply@para-siempre.love>",
      to: [`${firstName} ${lastName} <${email}>`],
      subject: "Thank you for RSVP",
      text: "Thank you for RSVP",
      html: `
        <html>
          <head>
            <style>
              body { font-family: sans-serif; }
              .container { padding: 20px; border: 1px solid #eee; }
              h1 { color: #333; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Thank You for Your RSVP, ${firstName}!</h1>
              <p>Hi ${firstName} ${lastName},</p>
              <p>We've received your RSVP for our wedding. We're so excited to celebrate with you!</p>
              <br>
              <p>Warmly,</p>
              <p>Jun & Leslie</p>
            </div>
          </body>
        </html>
      `,
    });
    await rsvpCollection.doc(docId).update({ confirmationEmailSent: true });
    return { success: true, data };
  } catch (error) {
    throw new HttpsError("internal", "Failed to send email: " + error.message);
  }
}
exports.sendConfirmationEmail = onCall(sendEmail);

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
    return sendEmail(guestData, docId);
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
