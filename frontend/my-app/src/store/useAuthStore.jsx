import {create} from "zustand"
import {toast} from "react-hot-toast"

export const useAuthStore = create((set) => ({
    user:null,
    token:null,
    loading: false,
    checkingAuth: true,

    signup: async (username, email, school, role, password, confirmPassword) => {
        set({loading: true})
        if(password !== confirmPassword){
            set({loading: false})
            return toast.error("Password do not match")
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type":"application/json",
                },
                body: JSON.stringify({ 
                    username,
                    email,
                    school,
                    role,
                    password,
                    confirmPassword,
                })
            })
            const data = await response.json();
            console.log("data response", data)
            if(!response.ok){
                throw new Error(data.message || "Smething went wrong")
            }
            set({ token: data.token, user: data.user, loading: false });
            localStorage.setItem("auth",JSON.stringify({
                user:data.user,
                token:data.token,
            }))

            return { success: true };
        } catch (error) {
            set({loading:false});
            return ({success: false, error:error.message})
        }
    },
    login: async(email, password) =>{
        set({loading: true})
        try {
            const response = await fetch("http://localhost:5000/api/auth/login",{
                method:"POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body:JSON.stringify({
                    email,
                    password
                })
            });
            const data = await response.json();
            console.log(data)
            if(!response.ok){
                throw new Error(data.message || data.error || "Login failed")
            }

            localStorage.setItem("authToken", data.token)

            set({token: data.token, user: data.user, loading: false})

        } catch (error) {
            set({loading:false});
            toast.error(error.message || "Login failed")
        }
    },
    checkAuth: async () => {
        set({checkingAuth: true})
        try {
            const token = await localStorage.getItem("token");
            const userJson = await localStorage.getItem("user");

            let user = null

            if(userJson && userJson !== "undefine" && userJson !== "null"){
                try {
                    user = JSON.parse(userJson)
                } catch (parseError) {
                    console.log("Failed to parse user data", parseError)
                }
            }
            set({token, user})
        } catch (error) {
            console.log("Auth check failed", error.message)
        }
    },

    logout: async () => {
        await localStorage.removeItem("token");
        await localStorage.removeItem("user");

        set({token: null, user:null});
    },
    
}))