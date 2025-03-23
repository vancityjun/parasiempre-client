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
    <>
      <p className="title">
        Thank you for RSVP! we&apos;ll send you a confirmation email to {email}
      </p>
      <div>
        <p>First name: {firstName}</p>
        <p>Last name: {lastName}</p>
        <p>Email: {email}</p>
      </div>
      <div>
        {Object.entries(answers).map(([key, answer]) => (
          <p key={key}>
            {questionnaireFlow[key].question}: {answer}
          </p>
        ))}
      </div>
      <Button title="change my answer" onClick={changeAnswer} />
    </>
  );
};

export default RsvpConfirmation;
