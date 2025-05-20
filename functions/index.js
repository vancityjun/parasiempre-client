/* eslint-disable no-undef */
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const Mailgun = require("mailgun.js").default;
const FormData = require("form-data");
const { getStorage } = require("firebase-admin/storage");
// const { MAILGUN_API_KEY } = process.env;
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

async function sendEmail(
  guestData,
  docId,
  subject,
  body,
  emailType = "rsvpConfirmation",
  update,
) {
  const mailgun = new Mailgun(FormData);
  if (!MAILGUN_API_KEY) {
    throw new HttpsError("internal", "API key is not defined");
  }
  const mg = mailgun.client({
    username: "api",
    key: MAILGUN_API_KEY,
  });

  const { email, firstName, lastName = "", questionnaireAnswers } = guestData;

  let htmlContent = "";

  const styles = `
    <style>
      body { font-family: sans-serif; color: #333; }
      .container { padding: 20px; border: 1px solid #eee; max-width: 600px; margin: 20px auto; }
      h1 { color: #d49a9a; font-size: 1.8rem; }
      h3 { font-size: 1.2rem; color: #555; }
      p { font-size: 15px; line-height: 1.6; }
      a { color: #d49a9a; text-decoration: none; }
      a:hover { text-decoration: underline; }
      .info-block { margin-top: 15px; padding-top: 15px; border-top: 1px solid #f0f0f0; }
    </style>
  `;

  if (emailType === "rsvpConfirmation" || emailType === "reminder") {
    htmlContent = `
      <html>
        <head>${styles}</head>
        <body>
          <div class="container">
            <h1>${emailType === "reminder" ? "Friendly Reminder!" : `Thank You for Your RSVP, ${firstName}!`}</h1>
            <p>Hi ${firstName} ${lastName || ""},</p>
            <p>${body}</p>
            <div class="info-block">
              <h3>Event Details:</h3>
              <p><strong>When:</strong> May 11th, Sunday at 2:00 PM</p>
              <p><strong>Where:</strong> 9850 64th St W, University Place, WA 98467, United States</p>
            </div>
            ${
              emailType === "rsvpConfirmation" && questionnaireAnswers
                ? `
            <div class="info-block">
              <p><b>Your RSVP Information:</b></p>
              <p>First name: ${firstName}</p>
              <p>Last name: ${lastName || "N/A"}</p>
              ${Object.entries(questionnaireAnswers || {})
                .map(([key, answer]) => {
                  const qInfo = require("./questionnaireFlow.json")[key];
                  return qInfo
                    ? `<p><strong>${qInfo.question}:</strong> ${answer}</p>`
                    : "";
                })
                .filter((line) => line)
                .join("\n    ")}
              <p>Need to make changes? Please contact Jun & Leslie directly.</p>
            </div>
            `
                : ""
            }
            <p>More information at <a href="https://www.para-siempre.love">para-siempre.love</a></p>
            <p>Warmly,</p>
            <p>Jun ❤️ Leslie</p>
          </div>
        </body>
      </html>`;
  } else if (emailType === "afterWedding") {
    htmlContent = `
      <html>
        <head>${styles}</head>
        <body>
          <div class="container">
            <h1>Thank You for Celebrating With Us, ${firstName}!</h1>
            <p>Hi ${firstName} ${lastName || ""},</p>
            <p>${body}</p>
            <p>We'd love to see all the wonderful moments you captured! Please share your photos and videos from the wedding on our website: <a href="https://www.para-siempre.love/upload">para-siempre.love/upload</a>.</p>
            <p>You can also send them directly to Jun & Leslie's families.</p>
            <p>Warmly,</p>
            <p>Jun ❤️ Leslie</p>
          </div>
        </body>
      </html>`;
  }

  try {
    const data = await mg.messages.create("para-siempre.love", {
      from: "Jun ❤️ Leslie <no-reply@para-siempre.love>",
      to: [`${firstName} ${lastName} <${email}>`],
      subject,
      html: htmlContent,
    });
    update && (await rsvpCollection.doc(docId).update(update));
    return { success: true, data };
  } catch (error) {
    throw new HttpsError("internal", "Failed to send email: " + error.message);
  }
}

async function sendReminderEmailToAll() {
  try {
    const snapshot = await rsvpCollection.get();

    if (snapshot.empty) {
      console.log("No RSVPs found to send reminders to.");
      return { message: "No RSVPs found." };
    }

    const emailPromises = snapshot.docs.map(async (doc) => {
      const guestData = doc.data(); // Get the actual data
      const body = `
      Just a friendly reminder about our wedding! We're so excited to celebrate with you soon. Our special day is just one week away!
    `;
      return sendEmail(
        guestData,
        doc.id,
        "Wedding Reminder: Jun ❤️ Leslie",
        body,
        "reminder",
        {
          reminderSent: true,
        },
      );
    });

    await Promise.all(emailPromises); // Wait for ALL email promises to settle
    console.log(`Attempted to send ${emailPromises.length} reminder emails.`);
    return {
      message: `Attempted to send ${emailPromises.length} reminder emails.`,
    };
  } catch (error) {
    console.error("Error sending reminder emails:", error);
    // Re-throw as HttpsError if you want the client to see a specific error
    if (error instanceof HttpsError) throw error;
    throw new HttpsError(
      "internal",
      "Failed to send reminder emails.",
      error.message,
    );
  }
}

async function sendAfterMailToAll() {
  try {
    const snapshot = await rsvpCollection.get();

    if (snapshot.empty) {
      console.log("No RSVPs found to send email to.");
      return { message: "No RSVPs found." };
    }

    const emailPromises = snapshot.docs.map(async (doc) => {
      const guestData = doc.data();
      if (!guestData.shownUp) {
        // Send only if they showed up
        console.log(
          `Skipping "after wedding" email for ${guestData.email} because they were marked as not shown up.`,
        );
        return;
      }
      const body = `
      Thank you so much for celebrating with us at our wedding! We hope you had a wonderful time sharing in our joy.
    `;

      return sendEmail(
        guestData,
        doc.id,
        "Thank you for joining Jun ❤️ Leslie's wedding!",
        body,
        "afterWedding",
        {
          afterEmailSent: true,
        },
      );
    });

    await Promise.all(emailPromises);
    const msg = `Attempted to send ${emailPromises.length} after emails.`;
    console.log(msg);
    return {
      message: msg,
    };
  } catch (error) {
    console.error("Error sending after emails:", error);
    // Re-throw as HttpsError if you want the client to see a specific error
    if (error instanceof HttpsError) throw error;
    throw new HttpsError(
      "internal",
      "Failed to send after emails.",
      error.message,
    );
  }
}

exports.sendReminderEmail = onCall(async () => await sendReminderEmailToAll());
exports.sendAfterEmail = onCall(async () => await sendAfterMailToAll());

exports.sendConfirmationEmail = onCall(
  async (request) =>
    await sendEmail(
      request.data,
      request.data.id,
      "Thank you for RSVP",
      "We've received your RSVP for our wedding. We're so excited to celebrate with you!",
      "rsvpConfirmation",
      { confirmationEmailSent: true },
    ),
);

exports.toggleShowUp = onCall(
  async ({ data: { shownUp, id } }) =>
    await rsvpCollection.doc(id).update({ shownUp }),
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
      "rsvpConfirmation",
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

exports.listMediaPaginated = onCall(async (request) => {
  const bucket = getStorage().bucket();
  const pageSize =
    request.data.pageSize &&
    Number.isInteger(request.data.pageSize) &&
    request.data.pageSize > 0
      ? request.data.pageSize
      : 9;
  const pageToken = request.data.pageToken || undefined;
  const prefix = "photos/";
  try {
    const [files, nextQuery] = await bucket.getFiles({
      prefix: prefix,
      maxResults: pageSize,
      pageToken: pageToken,
      autoPaginate: false,
    });

    const itemsWithUrls = await Promise.all(
      files
        .filter((file) => file.name !== prefix && !file.name.endsWith("/")) // Filter out the prefix folder itself and any sub-folder objects
        .map(async (file) => {
          // Generate a signed URL for each file. These URLs have an expiration.
          // Ensure your service account has "Storage Object Viewer" role or similar.
          const [url] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
          });
          // Get name relative to prefix for display, but keep full name for unique key
          const displayName = file.name.substring(prefix.length);
          return { name: displayName, url, fullName: file.name };
        }),
    );

    return {
      mediaItems: itemsWithUrls,
      nextPageToken:
        nextQuery && nextQuery.pageToken ? nextQuery.pageToken : null,
    };
  } catch (error) {
    console.error("Error listing files in Firebase Function:", error);
    throw new HttpsError(
      "internal",
      "Failed to list media files. Please try again later.",
      error.message,
    );
  }
});

exports.deleteMediaItem = onCall(async (request) => {
  // Check if the user is authenticated (Firebase automatically does this for onCall)
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  const { fullName } = request.data; // e.g., "photos/my-image.jpg"
  if (!fullName || typeof fullName !== "string") {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with a 'fullName' (string) argument representing the full path to the file.",
    );
  }

  console.log(
    `Attempting to delete media item: ${fullName} by user: ${request.auth.uid}`,
  );

  try {
    const bucket = getStorage().bucket();
    const file = bucket.file(fullName);

    await file.delete();
    console.log(`Successfully deleted ${fullName}`);
    return { success: true, message: `Successfully deleted ${fullName}` };
  } catch (error) {
    console.error(`Failed to delete ${fullName}:`, error);
    throw new HttpsError(
      "internal",
      "Failed to delete media item.",
      error.message,
    );
  }
});
