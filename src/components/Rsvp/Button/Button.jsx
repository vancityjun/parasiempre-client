import "./button.scss";

const Button = ({ disabled, onClick, title }) => {
  return (
    <button disabled={disabled} className="submit-button" onClick={onClick}>
      {title}
    </button>
  );
};

export default Button;
