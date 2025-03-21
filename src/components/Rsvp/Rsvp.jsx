import { useState } from "react";
import InputField from "./InputField";
import Select from "./Select";
import Questionnaire from "./Questionnaire";
import Button from "./Button";
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useMemo } from "react";
import "./Rsvp.scss";
import RsvpConfirmation from "../RsvpConfirmation";

const submitStatus = {
  none: "none",
  submitting: "submitting",
  done: "done",
};

const Rsvp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [guestCount, setGuestCount] = useState(0);
  const [submitState, setSubmitState] = useState(submitStatus.none);
  const [submissionError, setSubmissionError] = useState(null);
  const [recordId, setRecordId] = useState('')

  const [answers, setAnswers] = useState({});

  const validateEmail = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
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
        email,
        guestCount,
        questionnaireAnswers: answers,
        timestamp: new Date(),
      };
      try {
        if (recordId) { 
          const docRef = doc(db, "rsvps", recordId);
          await updateDoc(docRef, dataToSend);
        }
        const querySnapshot = await getDocs(
          query(
            collection(db, "rsvps"),
            where("email", "==", dataToSend.email),
          ),
        );
        if (!querySnapshot.empty) {
          setSubmissionError("Email already exists");
          setSubmitState(submitStatus.none);
          return;
        }
        const docRef = await addDoc(collection(db, "rsvps"), dataToSend);
        setRecordId(docRef.id)
        setSubmitState(submitStatus.done);
      } catch (error) {
        console.error("Error adding document: ", error);
        setSubmissionError(
          `Failed to submit RSVP Please check your connection and try again.`,
        );
        setSubmitState(submitStatus.none);
      }
    }
  };

  const isSubmitting = useMemo(
    () => submitState === submitStatus.submitting,
    [submitState],
  );

  if (submitState === submitStatus.done) {
    return (
      <RsvpConfirmation
        email={email}
        firstName={firstName}
        lastName={lastName}
        answers={answers}
        changeAnswer={() => setSubmitState(submitStatus.none)}
      />
    );
  }

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
      <InputField type="email" title={"Email"} isRequired setVal={setEmail} val={email} />
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
        answers={answers}
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
