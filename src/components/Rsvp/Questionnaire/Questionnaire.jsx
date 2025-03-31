import Question from "./Question";
import InputField from "../InputField";
import "./Questionnaire.scss";

export const Questionnaire = ({
  setSubmitEnabled,
  setAnswers,
  answers,
  questionState,
}) => {
  const [questions, setQuestions] = questionState;

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
        const answer = answers[name];
        if (disabled || !name) {
          return;
        }
        switch (name) {
          case "done":
            return null;
          case "contact":
            return (
              <div key={name} className="question">
                <p className="phone-number-message">{questionnaire.message}</p>
                <InputField
                  key={name}
                  title={question}
                  isRequired
                  setVal={(val) => handlePhoneNumber(val, name)}
                  val={answer}
                />
              </div>
            );
          default:
            return (
              <Question
                currentQuestion={questionnaire}
                onSelectHandler={onSelectHandler}
                key={name}
                val={answer}
              />
            );
        }
      })}
    </div>
  );
};
