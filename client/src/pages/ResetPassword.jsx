import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const navigate = useNavigate();

  const { backendUrl } = useContext(AppContext);
  axios.defaults.withCredentials = true;

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const inputRefs = useRef([]);

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

  const onSubmitEmailHandler = async (e) => {
    e.preventDefault();
    // Handle email submission logic here
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-reset-otp",
        { email },
        { withCredentials: true }
      );
      if (data.success) {
        setIsEmailSent(true);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const onSubmitOtpHandler = async (e) => {
    e.preventDefault();
    try {
      const otpArray = inputRefs.current.map((input) => input.value);
      const otp = otpArray.join("");
      setOtp(otp);
      setIsOtpVerified(true);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const onSubmitNewPasswordHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/reset-password",
        { email, otp, newPassword },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 sm:w-32 w-28 cursor-pointer"
      />
      {/* Reset Password Form */}
      {!isEmailSent && (
        <form
          onSubmit={onSubmitEmailHandler}
          className="bg-slate-900 p-8 rounded-lg text-sm w-96"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter your registered email address.
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input
              type="email"
              placeholder="Email id"
              className="bg-transparent outline-none text-white"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <button className="w-full py-2.5 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3 cursor-pointer">
            Submit
          </button>
        </form>
      )}

      {/* OTP Verification Form */}
      {isEmailSent && !isOtpVerified && (
        <form
          className="bg-slate-900 p-8 rounded-lg text-sm w-96"
          onSubmit={onSubmitOtpHandler}
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password OTP
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
          <button className="w-full py-2.5 bg-linear-to-r from-indigo-500 to-indigo-900 rounded-full cursor-pointer">
            Submit
          </button>
        </form>
      )}

      {/* Enter New Password Form */}
      {isEmailSent && isOtpVerified && (
        <form onSubmit={onSubmitNewPasswordHandler} className="bg-slate-900 p-8 rounded-lg text-sm w-96">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            New Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter the new password below.
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent outline-none text-white"
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
            />
          </div>
          <button className="w-full py-2.5 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3 cursor-pointer">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};
export default ResetPassword;
