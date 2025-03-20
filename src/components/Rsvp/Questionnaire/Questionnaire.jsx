import { useState } from "react";
import Question from "./Question";
import InputField from "../InputField";
import "./Questionnaire.scss";

export const Questionnaire = ({ setSubmitEnabled, setAnswers }) => {
  const questionnaireFlow = {
    "not-from-state": {
      name: "not-from-state",
      question: "Are you coming from outside of US?",
      // yes: 'is-canadian',
      yes: "driving",
      no: "done",
      next: null,
      disabled: false,
    },
    // "is-canadian": {
    //   name: "is-canadian",
    //   question: "are you a Canadian Citizen and have a valid passport?",
    //   yes: "driving",
    //   no: "visa-info",
    //   next: null
    // },
    // "visa-info": {
    //   next: "driving"
    // },
    driving: {
      name: "driving",
      question: "are you driving? (from Canada)",
      yes: "done",
      no: "need-ride",
      next: null,
      disabled: true,
    },
    "need-ride": {
      name: "need-ride",
      question: "need a ride arrangement?",
      yes: "leave-contact",
      no: "done",
      next: null,
      disabled: true,
    },
    "leave-contact": {
      name: "leave-contact",
      question: "leave a phone number we will contact you",
      next: "done",
      disabled: true,
    },
    done: null,
  };
  const [questions, setQuestions] = useState(questionnaireFlow);

  const removeRelatedQuestions = (currentQuestionName) => {
    if (currentQuestionName && currentQuestionName !== "done") {
      const nextQuestionName = questions[currentQuestionName].next;
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
    setAnswers((state) => ({ ...state, currentName: val }));
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

  return (
    <div className="questionnaire">
      {Object.values(questions).map((questionnaire) => {
        const { name, disabled, question } = questionnaire || {};
        if (disabled || !name) {
          return;
        }
        switch (name) {
          case "done":
            break;
          case "leave-contact":
            return (
              <div key={name}>
                <p>{question}</p>
                <InputField key={name} title="phone number" isRequired />
              </div>
            );
          default:
            return (
              <Question
                currentQuestion={questionnaire}
                onSelectHandler={onSelectHandler}
                key={name}
              />
            );
        }
      })}
    </div>
  );
};
