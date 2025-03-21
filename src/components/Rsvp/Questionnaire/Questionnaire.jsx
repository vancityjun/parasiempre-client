import { useState } from "react";
import Question from "./Question";
import InputField from "../InputField";
import "./Questionnaire.scss";
import questionnaireFlow from "./questionnaireFlow.json";

export const Questionnaire = ({ setSubmitEnabled, setAnswers, answers }) => {
  const [questions, setQuestions] = useState(questionnaireFlow);

  const deleteAnswer = (name) => {
    setAnswers((prevState) => {
      const newState = { ...prevState };
      delete newState[name];
      return newState;
    });
  };

  const removeRelatedQuestions = (currentQuestionName) => {
    if (currentQuestionName && currentQuestionName !== "done") {
      const nextQuestionName = questions[currentQuestionName].next;
      deleteAnswer(currentQuestionName);
      questions[currentQuestionName].next = null;
      removeRelatedQuestions(nextQuestionName);

      setQuestions((state) => ({
        ...state,
        [currentQuestionName]: {
          ...questions[currentQuestionName],
          disabled: true,
        },
      }));
    }
  };

  const onSelectHandler = (next, val, currentName) => {
    const { next: nextQuestionName } = questions[currentName];
    if (nextQuestionName) {
      setSubmitEnabled(false);
      removeRelatedQuestions(nextQuestionName);
    }
    setAnswers((state) => ({ ...state, [currentName]: val }));
    if (next === "done") {
      setSubmitEnabled(true);
      return;
    }
    questions[currentName].next = next;
    setQuestions((state) => ({
      ...state,
      [next]: { ...questions[next], disabled: false },
    }));
  };

  const validatePhoneNumber = (phoneNumber) => {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, "");
    return (
      cleaned.length === 10 ||
      (cleaned.length === 11 && cleaned.startsWith("1"))
    );
  };

  const handlePhoneNumber = (val, currentName) => {
    if (validatePhoneNumber(val)) {
      setAnswers((state) => ({ ...state, [currentName]: val }));
      setSubmitEnabled(true);
    }
  };

  return (
    <div className="questionnaire">
      {Object.values(questions).map((questionnaire) => {
        const { name, disabled, question } = questionnaire || {};
        if ((disabled || !name) && !answers[name]) {
          return;
        }
        switch (name) {
          case "done":
            break;
          case "leave-contact":
            return (
              <div key={name}>
                <p>{question}</p>
                <InputField
                  key={name}
                  title="phone number"
                  isRequired
                  setVal={(val) => handlePhoneNumber(val, name)}
                />
              </div>
            );
          default:
            return (
              <Question
                currentQuestion={questionnaire}
                onSelectHandler={onSelectHandler}
                key={name}
                val={answers[name]}
              />
            );
        }
      })}
    </div>
  );
};
