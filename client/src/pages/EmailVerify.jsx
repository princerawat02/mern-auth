import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext, useEffect, useRef } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const EmailVerify = () => {
  const { backendUrl, isLoggedIn, userData, getUserData } =
    useContext(AppContext);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const handleInput = (e, index) => {
    const value = e.target.value;
    if (value.length === 1 && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    pasteData.split("").forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
    if (pasteData.length === 6) {
      inputRefs.current[5].focus();
    } else {
      inputRefs.current[pasteData.length].focus();
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    // Handle OTP submission logic here
    const otpArray = inputRefs.current.map((input) => input.value);
    const otp = otpArray.join("");
    const { data } = await axios.post(
      backendUrl + "/api/auth/verify-account",
      { otp },
      { withCredentials: true }
    );

    if (data.success) {
      toast.success(data.message);
      getUserData();
      navigate("/");
    } else {
      toast.error(data.message);
    }
  };

  useEffect(() => {
    isLoggedIn && userData && userData.isAccountVerified && navigate("/");
  }, [isLoggedIn, userData, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 sm:w-32 w-28 cursor-pointer"
      />

      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 p-8 rounded-lg text-sm w-96"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter the 6-digit code sent to your email id.
        </p>
        <div className="flex justify-between mb-8">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                key={index}
                ref={(e) => (inputRefs.current[index] = e)}
                type="text"
                maxLength="1"
                required
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-white text-xl rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
              />
            ))}
        </div>
        <button className="w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 rounded-full cursor-pointer">
          Verify email
        </button>
      </form>
    </div>
  );
};
export default EmailVerify;
