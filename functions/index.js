/* eslint-disable no-undef */
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
require("dotenv").config();

const sgMail = require("@sendgrid/mail");
const { SENDGRID_API_KEY, COLLECTION } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);
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

// Helper function to send email
// async function sendEmail(guestData, action, docId) {
//   const { email, firstName, lastName, answers } = guestData;
//   // const emailHtml = renderToString(
//   //   React.createElement(RsvpConfirmation, {
//   //     email,
//   //     firstName,
//   //     lastName,
//   //     answers,
//   //   }),
//   // );

//   const mailOptions = {
//     from: my_email,
//     to: email,
//     subject: `Jun & Leslie's Wedding RSVP Confirmation`,
//     html: `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="utf-8">
//         </head>
//         <body>
//           ${firstName}
//           ${lastName}
//           ${answers}
//           ${docId}
//         </body>
//       </html>
//     `,
//   };

//   try {
//     await sgMail.send(mailOptions);
//     console.log(`Email sent for ${action} guest ${email}`);
//     return null; // Success, no return value needed
//   } catch (error) {
//     console.error(`Error sending email for ${action}:`, error);
//     throw new Error(`Failed to send email: ${error.message}`); // Propagate error
//   }
// }

async function sendEmail(guestData, docId) {
  const { email, firstName, lastName, answers } = guestData;
  const msg = {
    to: "vancityjun@gmail.com",
    from: "vancityjun@gmail.com",
    subject: "new RSVP registered!",
    text: "and easy to do anywhere, even with Node.js",
    html: `<div>${firstName} ${lastName}</div>`,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
}

// Trigger for new RSVP creation
exports.sendConfirmationEmailOnCreate = onDocumentCreated(
  "rsvps/{id}",
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
