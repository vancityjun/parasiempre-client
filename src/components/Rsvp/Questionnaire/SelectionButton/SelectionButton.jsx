import "./SelectionButton.scss";

export const SelectionButton = ({ title, name, onSelect, checked }) => {
  const lowerCased = title.toLowerCase();
  const idFor = `${name}-${lowerCased}`;
  return (
    <div className={`selection-button`}>
      <input
        type="radio"
        id={idFor}
        name={name}
        value={lowerCased}
        onChange={onSelect}
        checked={checked}
      />
      <label
        className={`${title.toLowerCase()} ${checked && "checked"}`}
        htmlFor={idFor}
      >
        {title}
      </label>
    </div>
  );
};
