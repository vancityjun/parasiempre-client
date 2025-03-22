/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest, onCall, HttpsError } from "firebase-functions/v2/https";
import { schedule } from "firebase-functions/v2/pubsub";
import logger from "firebase-functions/logger";

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

import nodemailer from "nodemailer";
import { setApiKey, send } from "@sendgrid/mail";

import { initializeApp, firestore } from "firebase-admin";
initializeApp();

export const addRSVP = onCall(async (data, context) => {
  const db = firestore();
  const email = data.email;

  // Check if email exists
  const querySnapshot = await db
    .collection("rsvps")
    .where("email", "==", email)
    .get();
  if (!querySnapshot.empty) {
    throw new HttpsError("already-exists", "Email already exists");
  }

  // Add RSVP
  const docRef = await db.collection("rsvps").add(data);
  return { message: "RSVP added successfully", id: docRef.id };
});

const myEmail = "vancityjun@gmail.com";

setApiKey("SENDGRID_API_KEY"); // Get from SendGrid dashboard

export const sendReminder = schedule("every 24 hours").onRun(async () => {
  const db = firestore();
  const guests = await db.collection("guests").get();

  const emails = guests.docs.map((doc) => ({
    to: doc.data().email,
    from: myEmail, // Verified sender in SendGrid
    subject: "RSVP Reminder",
    text: "",
  }));

  await Promise.all(emails.map((email) => send(email)));
  console.log("Reminders sent!");
});
