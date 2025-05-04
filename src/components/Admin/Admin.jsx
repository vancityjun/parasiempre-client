import { useMemo } from "react";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import useSWR from "swr";
import "./Admin.scss";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../../firebase";
import Button from "../Button";
import { useAuth } from "../../contexts/AuthContext";

const functions = getFunctions(app);
const sendEmail = httpsCallable(functions, "sendConfirmationEmail");
const sendReminderEmail = httpsCallable(functions, "sendReminderEmail");

const fetcher = async (path) => {
  const rsvpCollection = collection(db, path);
  const ref = query(rsvpCollection, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const Admin = () => {
  const { data, error, isLoading } = useSWR("rsvps", fetcher);
  const { logout } = useAuth();

  const totalGuests = useMemo(() => {
    if (!data) return 0;
    return data.reduce((sum, guest) => sum + 1 + guest.guestCount, 0);
  }, [data]);

  if (error) return <div>Failed to load RSVPs: {error.message}</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="admin">
      <Button title="Log out" onClick={logout} />
      <p className="total">Guest total: {totalGuests}</p>
      <table>
        <thead>
          <th>First name</th>
          <th>Last name</th>
          <th>Email</th>
          <th>Guest count</th>
          <th>Answers</th>
          <th>Confirmation Email Sent</th>
        </thead>
        {data.map((guestData) => {
          const {
            id,
            firstName,
            lastName,
            email,
            guestCount,
            questionnaireAnswers,
            confirmationEmailSent,
          } = guestData;
          return (
            <tbody key={id}>
              <td>{firstName}</td>
              <td>{lastName}</td>
              <td>{email}</td>
              <td>{guestCount}</td>
              <td>
                <ul>
                  {Object.entries(questionnaireAnswers).map(([key, answer]) => (
                    <li key={key}>
                      {key}: <b>{answer}</b>
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                {confirmationEmailSent ? (
                  "done"
                ) : (
                  <Button
                    title="send confirmation email"
                    onClick={async () => {
                      try {
                        const result = await sendEmail(guestData);
                        console.log(result.data.message);
                      } catch (error) {
                        console.error("Error: ", error.message);
                      }
                    }}
                  />
                )}
              </td>
            </tbody>
          );
        })}
      </table>
      {/* <Button
        title="Send Reminder"
        onClick={async () => {
          try {
            await sendReminderEmail();
          } catch (error) {
            console.error(error);
          }
        }} */}
      />
    </div>
  );
};

export default Admin;
