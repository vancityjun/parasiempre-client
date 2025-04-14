/* eslint-disable no-undef */
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const Mailgun = require("mailgun.js").default;
const FormData = require("form-data");
const { MAILGUN_API_KEY } = process.env;
const COLLECTION = "rsvp_test";

initializeApp();
const db = getFirestore();
const rsvpCollection = db.collection(COLLECTION);

exports.addRSVP = onCall(async (request) => {
  const { email, id, ...data } = request.data;

  try {
    if (id) {
      await rsvpCollection.doc(id).update(data);
      return { message: "RSVP updated successfully", id };
    }

    // Check for duplicate email
    const querySnapshot = await rsvpCollection
      .where("email", "==", email)
      .get();
    if (!querySnapshot.empty) {
      throw new HttpsError("already-exists", "Email already exists");
    }

    // Add new RSVP
    const docRef = await rsvpCollection.add(data);
    return { message: "RSVP added successfully", id: docRef.id };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error processing RSVP", error.message);
  }
});

async function afterEmailSent(id) {
  try {
    const querySnapshot = await rsvpCollection.where("id", "==", id).get();
    await rsvpCollection
      .doc(id)
      .update({ ...querySnapshot, confirmationEmailSent: true });
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error processing RSVP", error.message);
  }
}

async function sendEmail(guestData) {
  const mailgun = new Mailgun(FormData);
  if (!MAILGUN_API_KEY) {
    throw new HttpsError("internal", "API key is not defined");
  }
  const mg = mailgun.client({
    username: "api",
    key: MAILGUN_API_KEY,
  });

  const { email, firstName, lastName, answers, id } = guestData;
  try {
    const data = await mg.messages.create(
      "sandbox9d9529be61b048f6b35f93a348716ed5.mailgun.org",
      {
        from: "Mailgun Sandbox <postmaster@sandbox9d9529be61b048f6b35f93a348716ed5.mailgun.org>",
        to: [`${firstName} ${lastName} <${email}>`],
        subject: "Thank you for RSVP",
        text: "Congratulations Jun Lee, you just sent an email with Mailgun! You are truly awesome!",
      },
    );
    // afterEmailSent(id);
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
    return sendEmail(guestData, docId);
  },
);

// Trigger for RSVP updates
// module.exports.sendConfirmationEmailOnUpdate = onDocumentUpdated(
//   "rsvps/{id}",
//   async (event) => {
//     const guestData = event.data.after.data();
//     const docId = event.data.after.id;
//     return sendEmail(guestData, "updated", docId);
//   },
// );
