import { useState } from "react";
import InputField from "./InputField";
import Select from "./Select";
import Questionnaire from "./Questionnaire";
import Button from "./Button";

const Rsvp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [emailInput, setEmailInput] = useState({
    val: "",
    isValid: true,
    isRequired: false,
  });

  const validateEmail = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return !emailInput.isRequired || emailRegex.test(emailInput.val);
  };

  const setEmailInputVal = (val) => {
    setEmailInput((state) => ({ ...state, val }));
  };

  return (
    <div>
      <h1>RSVP</h1>
      <InputField
        type="text"
        title={"First name"}
        isRequired
        val={firstName}
        setVal={setFirstName}
      />
      <InputField
        type="text"
        title={"Last name"}
        isRequired
        val={lastName}
        setVal={setLastName}
      />
      <InputField
        type="email"
        title={"Email"}
        isRequired={emailInput.isRequired}
        setVal={setEmailInputVal}
      />
      <p>
        By providing your email, you consent to receive wedding-related
        information and reminders from us. We will not send anything unrelated
        to the wedding.
      </p>
      <Select values={Array.from({ length: 10 }, (_, i) => i + 1)}>
        How many guests <span className="bold">(excluding yourself)</span> will
        you be bringing?
      </Select>
      <Questionnaire
        submitEnabled={submitEnabled}
        setSubmitEnabled={setSubmitEnabled}
      />
      <Button enabled={!submitEnabled} />
    </div>
  );
};

export default Rsvp;
