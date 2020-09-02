import { useState } from "react";
import axios from "axios";
import { useStoreActions } from "easy-peasy";

const LoginModal = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const setUser = useStoreActions((actions) => actions.user.setUser);
  const setHideModal = useStoreActions(
    (actions) => actions.modals.setHideModal
  );

  const handleSubmit = async () => {
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });
      if (response.data.status === "error") {
        alert(response.data.message);
        return;
      }
      // Log user in if credential check is successful:
      setUser(email);
      // Close modal:
      setHideModal();
    } catch (error) {
      alert(error.response.data.message);
      return;
    }
  };

  return (
    <>
      <h2>Log in</h2>
      <div>
        <form
          onSubmit={(event) => {
            handleSubmit();
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
          <button>Log in</button>
        </form>
        <p>
          Don't have an account yet?{" "}
          <a href="#" onClick={() => props.showSignup()}>
            Sign up
          </a>
        </p>
      </div>
    </>
  );
};

export default LoginModal;
