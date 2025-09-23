import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"
import { Video , Lock, LogOut, UserPlus, LogIn, Briefcase, Wallet} from "lucide-react"
import k from "../assets/k.png"


function Navbar() {
  const {user, logout} = useAuthStore();
  const isAdmin = user?.role === "admin";
  const isInstructor = user?.role === "instructor";
  const isGraduate = user?.role === "graduate";
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  }
  return (
    <div>
      <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800">
        <div className="container mx-auto px-4 py-3"></div>
        <div className="flex flex-wrap justify-between items-center">
          <Link
            to={"/"}
            className="text-4xl font-bold text-emerald-400 items-center space-x-2  flex"
          >
            
            Chafas Institute

            <img src={k} alt={"logo"}
            className="w-8 h-auto md:w-24 lg:w-32"
            />
          </Link>
          <nav className="flex flex-wrap items-center gap-4">
            <Link
              to={"/"}
              className="text-gray-300 hover:text-emerald-300 transition duration-300 ease-in-out"
            >
              Home
            </Link>
            {user && (
              <Link
                to={"/training"}
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium
              transition duration-300 ease-in-out flex items-center"
              >
                <Video className="inline-block mr-1" size={20} />
                <span className="hidden sm:inline">Training Session</span>
              </Link>
            )}
            {isAdmin && (
              <Link
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium
              transition duration-300 ease-in-out flex items-center"
                to={"/secret-dashboard"}
              >
                <Lock className="inline-block mr-1" size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}
            {isGraduate && (
              <Link
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium
              transition duration-300 ease-in-out flex items-center"
                to={"/graduate"}
              >
                <Briefcase className="inline-block mr-1" size={18}/>
                <span className="hidden sm:inline">Attachment</span>
              </Link>
            )}
            <Link to={"/payment"}
            className="bg-emerald-700 hover:bg-emerald-600 text-white py-2 px-4
            rounded-md flex items-center transition duration-300 ease-in-out"
            >
            <Wallet className="inline-block mr-1" size={18}/>
            <span className="hidden sm:inline">Register</span>
            </Link>
            {isInstructor && (
              <Link
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium
              transition duration-300 ease-in-out flex items-center"
                to={"/secret-instructor"}
              >
                <Lock className="inline-block mr-1" size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}
            {user ? (
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2
            rounded-md flex items-center transition duration-300 ease-in-out"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span className="hidden sm:inline ml-2">logout</span>
              </button>
            ) : (
              <>
                <Link
                  to={"/signup"}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white py-2 px-4
            rounded-md flex items-center transition duration-300 ease-in-out"
                >
                  <UserPlus className="mr-2" size={18} />
                  Sign Up
                </Link>
                <Link
                  to={"/login"}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4
            rounded-md flex items-center transition duration-300 ease-in-out"
                >
                  <LogIn className="mr-2" size={18} />
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
    </div>
  );
}

export default Navbar
