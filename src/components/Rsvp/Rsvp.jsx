import { useState } from "react";
import InputField from "./InputField";
import Select from "./Select";
import Questionnaire from "./Questionnaire";
import Button from "./Button";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useMemo } from "react";

const submitStatus = {
  none: "none",
  submitting: "submitting",
  done: "done",
};

const Rsvp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [emailInput, setEmailInput] = useState({
    val: "",
    isValid: true,
    isRequired: true,
  });
  const [guestCount, setGuestCount] = useState(0);
  const [submitState, setSubmitState] = useState("");
  const [submissionError, setSubmissionError] = useState(null);

  const [answers, setAnswers] = useState({});

  const validateEmail = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return !emailInput.isRequired || emailRegex.test(emailInput.val);
  };

  const setEmailInputVal = (val) => {
    setEmailInput((state) => ({ ...state, val }));
  };

  const handleGuestCountChange = (event) => {
    setGuestCount(parseInt(event.target.value));
  };

  const validateFields = () => {
    return Boolean(firstName && lastName) && validateEmail();
  };

  const onClickSend = async () => {
    setSubmitEnabled(false);
    if (validateFields()) {
      setSubmitState(submitStatus.submitting);
      setSubmissionError(null);

      const dataToSend = {
        firstName,
        lastName,
        email: emailInput.val,
        guestCount,
        questionnaireAnswers: answers,
        timestamp: new Date(),
      };
      try {
        const querySnapshot = await getDocs(query(
          collection(db, "rsvps"),
          where("email", "==", dataToSend.email),
        ));
        if (!querySnapshot.empty) {
          throw new Error("Email already exists");
        }
        const docRef = await addDoc(collection(db, "rsvps"), dataToSend);
        console.log("Document written with ID: ", docRef.id);
        alert("Thank you for your RSVP!");
      } catch (error) {
        console.error("Error adding document: ", error);
        setSubmissionError("Failed to submit RSVP. Please try again.");
      } finally {
        // setFirstName("");
        // setLastName("");
        // setEmailInput({ val: "", isValid: false, isRequired: true });
        // setAnswers({});
        // setGuestCount(0);
        setSubmitState(submitStatus.done);
      }
    }
  };

  const isSubmitting = useMemo(
    () => submitState === submitStatus.submitting,
    [submitState],
  );

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
      <Select
        values={Array.from({ length: 10 }, (_, i) => i)}
        onChange={handleGuestCountChange}
      >
        How many guests <span className="bold">(excluding yourself)</span> will
        you be bringing?
      </Select>
      <Questionnaire
        setSubmitEnabled={setSubmitEnabled}
        setAnswers={setAnswers}
      />
      {submissionError && <p className="error">{submissionError}</p>}
      <Button
        disabled={!submitEnabled || isSubmitting}
        onClick={onClickSend}
        title={isSubmitting ? "Submitting..." : "Submit"}
      />
    </div>
  );
};

export default Rsvp;
