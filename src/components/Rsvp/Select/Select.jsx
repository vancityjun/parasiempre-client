import "./select.scss";

const Select = ({ children, values }) => {
  return (
    <div className="select-field">
      <label htmlFor="">{children}</label>
      <select name="">
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
