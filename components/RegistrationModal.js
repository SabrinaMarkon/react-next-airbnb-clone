import { useState } from "react";
import axios from "axios";

const RegistrationModal = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordconfirmation, setPasswordconfirmation] = useState("");

  const submit = async () => {
    try {
      const response = await axios.post("/api/auth/register", {
        email,
        password,
        passwordconfirmation,
      });
      console.log(response);
      if (response.data.status === "error") {
        alert(response.data.message);
        return;
      }
    } catch (error) {
      alert(error.response.data.message);
      return;
    }
  };

  return (
    <>
      <h2>Sign up</h2>
      <div>
        <form
          onSubmit={(event) => {
            submit();
            event.preventDefault();
          }}
        >
          <input
            id="email"
            type="email"
            placeholder="Email address"
            required="required"
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            id="password"
            type="password"
            placeholder="Password"
            required="required"
            onChange={(event) => setPassword(event.target.value)}
          />
          <input
            id="passwordconfirmation"
            type="password"
            placeholder="Enter password again"
            required="required"
            onChange={(event) => setPasswordconfirmation(event.target.value)}
          />
          <button>Sign up</button>
        </form>
        <p>
          Already have an account?{" "}
          <a href="" onClick={() => props.showLogin()}>
            Log in
          </a>
        </p>
      </div>
    </>
  );
};

export default RegistrationModal;
