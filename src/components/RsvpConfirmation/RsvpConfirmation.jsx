import { useEffect } from "react";
import questionnaireFlow from "../Rsvp/Questionnaire/questionnaireFlow.json";
import "./RsvpConfirmation.scss"
import Button from "../rsvp/Button";

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
        Thank you for RRSP! we&apos;ll send you a confirmation email to {email}
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
