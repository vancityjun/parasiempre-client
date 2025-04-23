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

const fetcher = async (path) => {
  const rsvpCollection = collection(db, path);
  const ref = query(rsvpCollection, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const Admin = () => {
  const { data, error, isLoading } = useSWR("rsvps", fetcher);
  const { logout } = useAuth();

  if (error) return <div>Failed to load RSVPs: {error.message}</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <Button title="Log out" onClick={logout} />
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
    </div>
  );
};

export default Admin;
