import "./button.scss";

const Button = (disabled) => {
  return (
    <button disabled={disabled} className="submit-button">
      Submit
    </button>
  );
};

export default Button;
