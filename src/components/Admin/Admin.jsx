import { getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase";
import useSWR from "swr";
import  './Admin.scss'

const fetcher = async (path) => {
  const ref = collection(db, path);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const Admin = () => {
  const { data, error, isLoading } = useSWR("rsvps", fetcher);

  if (error) return <div>Failed to load RSVPs: {error.message}</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <table>
        <thead>
          <th>First name</th>
          <th>Last name</th>
          <th>Email</th>
          <th>guest count</th>
          <th>answers</th>
        </thead>
        {data.map(
          ({
            id,
            firstName,
            lastName,
            email,
            guestCount,
            questionnaireAnswers,
          }) => (
            <tbody key={id}>
              <td>{}</td>
              <td>{}</td>
              <td>{}</td>
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
            </tbody>
          ),
        )}
      </table>
    </div>
  );
};

export default Admin;
