import SelectionButton from "../SlectionButton";

const Question = ({
  currentQuestion: { question, name, yes, no },
  onSelectHandler,
}) => {
  return (
    <div>
      <p>{question}</p>
      {yes && (
        <SelectionButton
          title="Yes"
          name={name}
          onSelect={() => onSelectHandler(yes, "yes", name)}
        />
      )}
      {no && (
        <SelectionButton
          title="No"
          name={name}
          onSelect={() => onSelectHandler(no, "no", name)}
        />
      )}
    </div>
  );
};

export default Question;
