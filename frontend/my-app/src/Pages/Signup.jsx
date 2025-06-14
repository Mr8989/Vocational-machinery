import React, { useState } from 'react'
import {delay, motion} from 'framer-motion';
import { User, Mail, Lock, Loader, UserPlus, ArrowRight, School } from "lucide-react"
import {Link} from "react-router-dom"
import { useAuthStore} from "../store/useAuthStore"

function Signup() {

  const [formData, setFormData] = useState({
  username:"",
  email:"",
  school:"",
  role:"undergraduate",
  password:"",
  confirmPassword:"",
  });

  const {signup, loading} = useAuthStore();

  const handleSubmit =  async(e) => {
    if(formData.password !== formData.confirmPassword){
      alert("Password donot match")
    }
    else if(!formData.school || !formData.role){
      alert("School and role are required")
    }
    e.preventDefault();
    const result = await signup(
    formData.username,
    formData.email,
    formData.school,
    formData.role,
    formData.password,
    formData.confirmPassword
    )
    console.log(result, "Signup successfull")
  }
  return (
    <div className="flex flex-col justify-center py-2 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-400">
          Create an account
        </h2>
      </motion.div>
      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-gray-800 py-10 px-14 shadow sm:rounded-lg sm:px-10 h-full">
          <form onSubmit={handleSubmit} className="space-y-14">
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-300 block"
              >
                Enter name
              </label>
              <div className="mt-1 relative rounded-md shadow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center w-full flex-col space-x-2">
                  <User
                    className="absolute h-5 w-5 left-8 text-gray-400 mt-2"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="block w-full px-3 py-2 pl-10 bg-gray-700 border-gray-700 rounded-md shadow-sm
                  placeholder-gray-400 focus-outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="Enter name"
                  />
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 items-center w-full flex-col space-x-2 ">
                  <Mail
                    className="absolute h-5 w-5 left-8 text-gray-400 mt-2"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-700 rounded-md shadow-sm
            placeholder-gray-400 focus-outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="Enter email"
                  />
                </div>
              </div>
            </div>
            <div>
              <label
               htmlFor="name"
               className='block text-sm font-medium text-gray-300'
               >
                  School
              </label>
              <div className='mt-1 relative rounded-md shadow-sm'> 
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center w-full flex-col space-x-2'>
                    <School 
                    className='absolute h-5 w-5 left-8 text-gray-400 mt-2'
                    aria-hidden="true"
                    />
                    <input type="text"
                    id='school'
                    required
                    value={formData.school}
                    onChange={(e) => 
                      setFormData({...formData, school: e.target.value})
                    }
                    className='block w-full px-3 py-2 pl-10 bg-gray-700 rounded-md shadow-sm
                    placeholder-gray-400 focus-outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
                    placeholder='Name of tertiary institution'
                    />
                    </div>
              </div>
            </div>
            <div>
              <label 
              htmlFor="name"
              className='block text-sm font-medium text-gray-300'
              >
                Select
              </label>
              <div className='mt-1 relative rounded-md shadow-sm'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center w-full flex-col space=x-2'>
                    <select 
                    name="text" 
                    id="enroled"
                    className='block w-full px-3 py-2 pl-10 bg-gray-700 rounded-md shadow-sm
                    placeholder-gray-400 focus-outline focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'

                    value={formData.role}
                    onChange={(e) => 
                      setFormData({...formData, role: e.target.value})
                    }
                    >
                      <option value="undergraduate">Undergraduate</option>
                      <option value="graduate">Graduate</option>
                    </select>
                    </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300"
              >
                Enter password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center w-full flex-col space-x-2">
                  <Lock
                    className="absolute h-5 w-5 left-8 text-gray-400 mt-2"
                    aria-hidden="true"
                  />
                  <input
                    type="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="block w-full px-3 py-2 pl-10 bg-gray-700 border-gray-700 rounded-md shadow-sm
                  placeholder-gray-400 focus-outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="Enter password"
                  />
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center w-full flex-col space-x-2">
                  <Lock
                    className="absolute h-5 w-5 left-8 text-gray-400 mt-2"
                    aria-hidden="true"
                  />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    required
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm password"
                    className="block w-full px-3 py-2 pl-10 bg-gray-700 border-gray-700 rounded-md shadow-sm
                    placeholder-gray-400 focus-outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="flex w-full py-2 px-4 justify-center border border-transparent rounded-md
            shadow-sm text-white font-medium bg-emerald-400 hover:bg-emerald-700 
            transition duration-150 ease-in-out disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                <Loader
                className='mr-5 h-5 w-5 animate-spin'
                aria-hidden="true"
                />
                Loading...
                </>
              ): (
                <>
                <UserPlus className='mr-5 h-5 w-5' aria-hidden="true"/>
                Sign Up
                </>
              )}
            </button>
          </form>
          <p className='mt-8 text-sm text-center gap-3 text-gray-400'>
            Already have an account?
            <Link
            to={"/Login"}
            className='font-medium text-emerald-400 hover:text-emerald-300'
            >
              Login here
              <ArrowRight className='inline h-5 w-5'/>
            </Link>
            </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup
