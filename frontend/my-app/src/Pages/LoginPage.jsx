import React, { useState } from 'react'
import {motion} from "framer-motion"
import { Link } from 'react-router-dom';
import { Mail, Lock, Loader, ArrowRight, LogIn, EyeOff, Eye} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {login, loading} = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      await login(email, password)
      console.log("login successful", email, password)
      
    } catch (error) {
      console.log("Error in submit", error.message);
    }
  }
  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-400">
          Login to your account
        </h2>
      </motion.div>
      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-gray-800 py-10 px-4 shadow sm:rounded-lg sm:px-10 h-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300 block"
              >
                Enter email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center w-full flex-col space-x-2">
                  <Mail
                    className="absolute h-5 w-5 left-8 text-gray-400 mt-2"
                    aria-hidden="true"
                  />
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-2 py-2 pl-10 bg-gray-700 border border-gray-700 rounded-md shadow-sm
                    placeholder-gray-400 focus-outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="Enter email"
                  />
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300 block mt-13"
              >
                Enter password
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center w-full flex-col space-x-2">
                  <Lock
                    className="absolute h-5 w-5 left-8 text-gray-400 mt-2"
                    aria-hidden="true"
                  />
                  {/**Toggle button */}
                  <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute h-5 w-5 right-2 text-gray-400 mt-2'
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-700 rounded-md shadow-sm
              placeholder-gray-400 focus-outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="Enter password"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="flex w-full py-2 px-4 mt-16 justify-center border border-transparent rounded-md 
            shadow-sm text-white font-medium bg-emerald-400 hover:bg-emerald-700
            transition duration-150 ease-in-out disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader
                    className="mr-5 h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                  Loading...
                </>
              ) : (
                <>
                  <LogIn className="mr-5 h-5 w-5" aria-hidden="true" />
                  Login
                </>
              )}
            </button>
          </form>
          <p className="mt-8 text-sm text-center gap-3 text-gray-400">
            Don't have an account?{""}
            <Link
              to={"/signup"}
              className="font-medium text-emerald-400 hover:text-emerald-300"
            >
              Sign up here
              <ArrowRight className="inline h-5 w-5" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage
