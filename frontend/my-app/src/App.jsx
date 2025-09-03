import React, { useEffect } from "react";
import Signup from "./Pages/Signup";
import Navbar from "./components/Navbar";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home"
import LoginPage from "./Pages/LoginPage"
import AdminPage from "./components/AdminPage";
import { useAuthStore } from "./store/useAuthStore";
import Training from "./components/Training";
import LoadingSpinner from "./components/LoadingSpinner"
import InstructorPage from "./components/InstructorPage";
import ApplicationForms from "./components/ApplicationForms";
import PaymentGate from "./Pages/PaymentGate";
import { Toaster } from "react-hot-toast";


function App() {
  const {user, checkAuth, checkingAuth, logout} = useAuthStore();

  useEffect(() => {
    checkAuth()
  },[checkAuth])

  // if(checkingAuth){
  //   return <LoadingSpinner/>
  // }
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden text-white">
      <div className="relative z-50 pt-20">
        <Navbar />
        <Routes>
          <Route path="/payment" element={<PaymentGate/>}/>
          <Route path="/" element={<Home />} />
          <Route path="/Signup" element={!user ? <Signup /> : <Navigate to='/'/>} />
          <Route path="/Login" element={!user ?  <LoginPage /> : <Navigate to='/'/>} />
          <Route path="/training" element={<Training/>}/>
          <Route path="/secret-dashboard" element={user?.role === "admin" ? <AdminPage/> : <Navigate to="/"/>}/>
          <Route path="/secret-instructor" element={user?.role === "instructor" ? <InstructorPage/> : <Navigate to={"/"}/>}/>
          <Route path="/graduate" element={user?.role === "graduate" ? <ApplicationForms/> : <Navigate to={"/"}/>}/>
        </Routes>
        <Toaster/>
      </div>
    </div>
  );
}

export default App;
