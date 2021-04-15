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
    <div className="flex items-center justify-center h-screen">
      {formType === "signUp" && (
        <div className="flex flex-col items-center h-auto w-auto bg-white rounded-lg shadow-md p-10 ">
          <div className="font-sans font-bold text-4xl">Create Account</div>
          <div className="font-sans text-lg">
            Already Have an Account?{" "}
            <button
              className="focus:outline-none text-blue-500 underline focus:ring-transparent"
              onClick={() =>
                setFormState(() => ({ ...formState, formType: "signIn" }))
              }
            >
              Sign In
            </button>
          </div>
          <div className="w-full max-w-md my-4 space-y-3">
            <input
              className="pl-3 py-2 bg-gray-100 rounded-lg w-full"
              name="username"
              onChange={onChange}
              placeholder="Username"
            />
            <input
              className="pl-3 py-2 bg-gray-100 rounded-lg w-full"
              name="password"
              type="password"
              onChange={onChange}
              placeholder="Password"
            />
            <input
              className="pl-3 py-2 bg-gray-100 rounded-lg w-full"
              name="email"
              onChange={onChange}
              placeholder="Email"
            />
            <button
              className="pl-3 py-2 bg-blue-400 text-white rounded-lg w-full"
              onClick={signUp}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
      {formType === "confirmSignUp" && (
        <div className="flex items-center h-auto w-auto bg-white rounded-lg shadow-md p-10 space-x-4">
          {" "}
          <input
            className="pl-3 py-2 bg-gray-100 rounded-lg w-auto"
            name="authCode"
            onChange={onChange}
            placeholder="Confirmation Code"
          />
          <button
            className="p-2 bg-green-400 text-white rounded-lg w-full"
            onClick={confirmSignUp}
          >
            Confirm Code
          </button>
        </div>
      )}
      {formType === "signIn" && (
        <div className="flex flex-col items-center h-auto w-auto bg-white rounded-lg shadow-md p-10 space-x-4">
          <div className="font-sans font-bold text-4xl">Sign In</div>
          <div className="font-sans text-lg">
            Need an Account?{" "}
            <button
              className="focus:outline-none text-blue-500 underline focus:ring-transparent"
              onClick={() =>
                setFormState(() => ({ ...formState, formType: "signUp" }))
              }
            >
              Sign Up
            </button>
          </div>
          <div className="w-full max-w-md my-4 space-y-3">
            <input
              className="pl-3 py-2 bg-gray-100 rounded-lg w-full"
              name="username"
              onChange={onChange}
              placeholder="username"
            />
            <input
              className="pl-3 py-2 bg-gray-100 rounded-lg w-full"
              name="password"
              type="password"
              onChange={onChange}
              placeholder="password"
            />
            <button
              className="p-2 bg-blue-400 text-white rounded-lg w-full"
              onClick={signIn}
            >
              Sign In
            </button>
          </div>
        </div>
      )}
      {formType === "signedIn" && (
        <div className="flex flex-col items-center h-auto w-auto bg-white rounded-lg shadow-md p-10 space-y-4">
          <div className="font-sans font-bold text-4xl">
            Hello, {user.username} 😄
          </div>
          <button
            className="p-2 bg-red-400 text-white rounded-lg w-full"
            onClick={signOut}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
