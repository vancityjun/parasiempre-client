import "./button.scss";

const Button = ({ disabled, onClick, title }) => {
  return (
    <button disabled={disabled} onClick={onClick}>
      {title}
    </button>
  );
};

export default Button;
