import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    axios.defaults.withCredentials = true;

    try {
      const endpoint =
        state === "Sign Up"
          ? `${backendUrl}/api/auth/register`
          : `${backendUrl}/api/auth/login`;

      const payload =
        state === "Sign Up" ? { name, email, password } : { email, password };

      const { data } = await axios.post(endpoint, payload, {
        withCredentials: true,
      });

      if (data?.success) {
        setIsLoggedIn(true);
        getUserData();
        navigate("/");
        toast.success(
          state === "Sign Up"
            ? "Registered Successfully"
            : "Logged In Successfully"
        );
      } else {
        toast.error(data?.message || "Action failed");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      toast.error(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-linear-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 sm:w-32 w-28 cursor-pointer"
      />
      {/* Login Box */}
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign Up" ? "Create account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-3">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account!"}
        </p>
        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="" />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Full Name"
                required
                className="bg-transparent outline-none "
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email Id"
              required
              className="bg-transparent outline-none "
            />
          </div>
          <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
              className="bg-transparent outline-none "
            />
          </div>

          <p
            onClick={() => navigate("/reset-password")}
            className="mb-4 text-indigo-500 cursor-pointer"
          >
            Forgot password?
          </p>

          <button className="w-full py-2.5 rounded-full bg-linear-to-r from-indigo-500 to-indigo-800 text-white font-medium cursor-pointer">
            {state}
          </button>
        </form>
        {state === "Sign Up" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="cursor-pointer underline text-blue-400"
            >
              Login here
            </span>
          </p>
        ) : (
          <p
            className="text-gray-400 text-center text-xs mt-4"
            onClick={() => setState("Sign Up")}
          >
            Don't have an account?
            <span className="cursor-pointer underline text-blue-400">
              Sign up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
export default Login;
