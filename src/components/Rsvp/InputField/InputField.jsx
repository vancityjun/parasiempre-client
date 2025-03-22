import "./InputField.scss";

const InputField = ({ title, type, val, setVal, isRequired = false }) => {
  const onChangeHandler = ({ target: { value } }) => {
    setVal(value);
  };

  return (
    <div className="input-field">
      <label>
        {title}
        {isRequired && <span className="required-field">*</span>}
      </label>
      <input type={type} onChange={onChangeHandler} value={val} />
    </div>
  );
};

export default InputField;
