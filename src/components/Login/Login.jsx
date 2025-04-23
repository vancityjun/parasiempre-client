import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import InputField from "../Rsvp/InputField";
import Button from "../Button";
import "./Login.scss";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/admin");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      console.log(err.message);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <InputField
          title="Email"
          isRequired
          type="email"
          val={email}
          setVal={setEmail}
        />
        <InputField
          title="Password"
          isRequired
          type="password"
          val={password}
          setVal={setPassword}
        />
        <Button
          disabled={!(email && password)}
          onClick={handleSubmit}
          title="Login"
        />
      </form>
    </div>
  );
};

export default Login;
