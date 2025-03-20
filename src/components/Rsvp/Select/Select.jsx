import "./select.scss";

const Select = ({ children, values, onChange }) => {
  return (
    <div className="select-field">
      <label>{children}</label>
      <select onChange={onChange}>
        {values.map((value, index) => (
          <option
            key={index}
            value={typeof value === "string" ? value.lowerCase() : value}
          >
            {value}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
