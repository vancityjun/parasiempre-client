/* eslint-disable no-undef */
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onCreate, onUpdate } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { setApiKey, send } from "@sendgrid/mail";
import juice from "juice";
import questionnaireFlow from "../src/components/Rsvp/questionnaireFlow.json";

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();
const rsvpCollection = db.collection("rsvps");

const MY_EMAIL = process.env.EMAIL_MY_EMAIL;

setApiKey(process.env.EMAIL_SENDGRID_API_KEY);

// Callable function to add or update RSVP
export const addRSVP = onCall(async (data) => {
  const { email, id } = data;

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
async function sendEmail(guestData, action) {
  const { email, firstName, lastName, answers } = guestData;
  const css = readFileSync("./RsvpConfirmation", "utf8");

  const mailOptions = {
    from: MY_EMAIL,
    to: email,
    subject: "RSVP Confirmation",
    html: juice(`
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
            <ul className="answers">
        <li>
          First name: <b>${firstName}</b>
        </li>
        <li>
          Last name: <b>${lastName}</b>
        </li>
        <li>
          Email: <b>${email}</b>
        </li>
        ${Object.entries(answers).map(([key, answer]) => (
          <li key={key}>
            {questionnaireFlow[key].question}: <b>{answer}</b>
          </li>
        ))}
      </ul>
      </body>
    </html>
  `),
  };

  try {
    await send(mailOptions);
    console.log(`Email sent for ${action} guest ${email}`);
    return null; // Success, no return value needed
  } catch (error) {
    console.error(`Error sending email for ${action}:`, error);
    throw new Error(`Failed to send email: ${error.message}`); // Propagate error
  }
}

// Trigger for new RSVP creation
export const sendConfirmationEmailOnCreate = onCreate(
  "rsvps/{id}",
  (event, context) => {
    const guestData = event.data.data();
    console.log(guestData, context);
    return sendEmail(guestData, "created");
  },
);

// Trigger for RSVP updates
export const sendConfirmationEmailOnUpdate = onUpdate("rsvps/{id}", (event) => {
  const guestData = event.data.after.data();
  return sendEmail(guestData, "updated");
});
