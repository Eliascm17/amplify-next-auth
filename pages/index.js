import { useState, useEffect } from "react";
import Amplify, { Auth, Hub, Logger } from "aws-amplify";
import config from "../src/aws-exports";
Amplify.configure(config);

const initialState = {
  username: "",
  password: "",
  email: "",
  authCode: "",
  formType: "signUp",
};

export default function Home() {
  const [formState, setFormState] = useState(initialState);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkIfUser();
    setAuthListener();
  }, []);

  const setAuthListener = () => {
    const logger = new Logger("My-Logger");
    const listener = (data) => {
      switch (data.payload.event) {
        case "signOut":
          logger.info("user signed out");
          setFormState(() => ({ ...formState, formType: "signUp" }));
          break;
        default:
          break;
      }
    };
    Hub.listen("auth", listener);
  };

  const checkIfUser = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      setUser(user);
      setFormState(() => ({ ...formState, formType: "signedIn" }));
    } catch (error) {
      setUser(null);
    }
  };

  const onChange = (e) => {
    e.persist();
    setFormState(() => ({ ...formState, [e.target.name]: e.target.value }));
  };

  const { formType } = formState;

  const signUp = async () => {
    const { username, email, password } = formState;
    await Auth.signUp({ username, password, attributes: { email } });
    setFormState(() => ({ ...formState, formType: "confirmSignUp" }));
  };

  const confirmSignUp = async () => {
    const { username, authCode } = formState;
    await Auth.confirmSignUp(username, authCode);
    setFormState(() => ({ ...formState, formType: "signIn" }));
  };

  const signIn = async () => {
    const { username, password } = formState;
    const user = await Auth.signIn(username, password);
    setUser(user);
    setFormState(() => ({ ...formState, formType: "signedIn" }));
  };

  const signOut = async () => {
    await Auth.signOut();
  };

  return (
    <div className="flex flex-col justify-center items-center max-w-2xl mx-auto mb-16">
      {formType === "signUp" && (
        <div>
          <input name="username" onChange={onChange} placeholder="username" />
          <input
            name="password"
            type="password"
            onChange={onChange}
            placeholder="password"
          />
          <input name="email" onChange={onChange} placeholder="email" />
          <button onClick={signUp}>Sign Up</button>
          <button
            onClick={() =>
              setFormState(() => ({ ...formState, formType: "signIn" }))
            }
          >
            Sign In
          </button>
        </div>
      )}
      {formType === "confirmSignUp" && (
        <div>
          <input
            name="authCode"
            onChange={onChange}
            placeholder="Confirmation Code"
          />
          <button onClick={confirmSignUp}>Confirm Code</button>
        </div>
      )}
      {formType === "signIn" && (
        <div>
          <input name="username" onChange={onChange} placeholder="username" />
          <input
            name="password"
            type="password"
            onChange={onChange}
            placeholder="password"
          />
          <button onClick={signIn}>Sign In</button>
        </div>
      )}
      {formType === "signedIn" && (
        <div>
          <div>Hello, {user.username}</div>
          <button onClick={signOut}>Sign Out</button>
        </div>
      )}
    </div>
  );
}
