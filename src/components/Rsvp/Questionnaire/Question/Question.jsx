import SelectionButton from "../SelectionButton";
import "./Question.scss";

const Question = ({
  currentQuestion: { question, name, yes, no },
  onSelectHandler,
  val,
}) => {
  return (
    <div className="question">
      <p>{question}</p>
      <div className="selection-wrapper">
        {yes && (
          <SelectionButton
            title="Yes"
            name={name}
            onSelect={() => onSelectHandler(yes, "yes", name)}
            checked={val === "yes"}
          />
        )}
        {no && (
          <SelectionButton
            title="No"
            name={name}
            onSelect={() => onSelectHandler(no, "no", name)}
            checked={val === "no"}
          />
        )}
      </div>
    </div>
  );
};

export default Question;
