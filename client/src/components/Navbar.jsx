import { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedIn } =
    useContext(AppContext);

  const sendVerificationEmail = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp"
      );
      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setUserData(null);
        setIsLoggedIn(false);
        navigate("/login");
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };
  return (
    <div className="flex justify-between w-full items-center p-4 sm:p-6 sm:px-24 absolute top-0 ">
      <img src={assets.logo} alt="" className="w-28 sm:w-32" />
      {userData ? (
        <div className="flex justify-center items-center rounded-full h-8 w-8 text-white relative group bg-black cursor-pointer">
          {userData.name[0].toUpperCase()}

          <div className="absolute hidden group-hover:block hover:block top-0 right-0 pt-10 mt-2 z-10 text-black">
            <ul className="list-none p-2 bg-gray-100 text-sm">
              {!userData.isAccountVerified && (
                <li onClick={sendVerificationEmail} className="py-1 px-2 hover:bg-gray-200 cursor-pointer whitespace-nowrap">
                  Verify email
                </li>
              )}
              <li
                onClick={logout}
                className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all cursor-pointer group"
          onClick={() => navigate("/login")}
        >
          Login{" "}
          <img
            src={assets.arrow_icon}
            alt=""
            className="group-hover:translate-x-1 transition-transform w-4"
          />
        </button>
      )}
    </div>
  );
};
export default Navbar;
