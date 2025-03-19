export const SelectionButton = ({ title, name, onSelect, checked }) => {
  const lowerCased = title.toLowerCase();
  return (
    <div>
      <input
        type="radio"
        id={lowerCased}
        name={name}
        value={lowerCased}
        onChange={onSelect}
        checked={checked}
      />
      <label htmlFor={lowerCased}>{title}</label>
    </div>
  );
};
