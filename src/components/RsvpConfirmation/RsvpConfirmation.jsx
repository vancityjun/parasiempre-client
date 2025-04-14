import questionnaireFlow from "../Rsvp/questionnaireFlow.json";
import "./RsvpConfirmation.scss";
import Button from "../Button";

const RsvpConfirmation = ({
  email,
  firstName,
  lastName,
  answers,
  changeAnswer,
}) => {
  return (
    <section className="rsvp confirmation">
      <h2 className="title">Thank you for RSVP!</h2>
      <p className="desc">
        We&apos;ll send you a confirmation email to {email}
      </p>
      <ul className="answers">
        <li>
          First name: <b>{firstName}</b>
        </li>
        <li>
          Last name: <b>{lastName}</b>
        </li>
        <li>
          Email: <b>{email}</b>
        </li>
        {Object.entries(answers).map(([key, answer]) => (
          <li key={key}>
            {questionnaireFlow[key].question}: <b>{answer}</b>
          </li>
        ))}
      </ul>
      <Button title="Change my answer" onClick={changeAnswer} />
    </section>
  );
};

export default RsvpConfirmation;
