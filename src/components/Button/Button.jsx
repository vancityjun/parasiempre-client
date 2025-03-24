import "./button.scss";

const Button = ({ disabled, onClick, title, className }) => {
  return (
    <button disabled={disabled} onClick={onClick} className={className}>
      {title}
    </button>
  );
};

export default Button;
