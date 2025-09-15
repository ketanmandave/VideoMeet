import React, { createContext, useState } from "react";
import axios, { HttpStatusCode } from "axios";
import { useNavigate } from "react-router-dom";
import server from "../environment";
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [userdata, setUserdata] = useState({});

  const client = axios.create({
    baseURL: "https://your-app-backend-1dz5.onrender.com/api/v1/users",
  });

  const handleRegister = async (name, username, password) => {
    try {
      const response = await client.post("/register", {
        name,
        username,
        password,
      });

      if (response.status === 201) {
        setUserdata(response.data);
      }

      return response; // ✅ return response so caller can use it
    } catch (error) {
      throw error; // ✅ rethrow so we can catch in component
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await client.post("/login", {
        username,
        password,
      });

      if (response.status === HttpStatusCode.Ok) {
        localStorage.setItem("token", response.data.token);
        navigate("/home");
      }

      return response; // ✅ also return response

    } catch (error) {
      throw error;
    }
  };

  const getHistoryOfUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      let response = await client.get("/get_all_activity", { params: { token } });

      return response.data;
    } catch (err) {
      console.error("❌ Failed to fetch history:", err.response?.data || err.message);
      return []; // ✅ return empty array instead of throwing
    }
  };


  const addToUserHistory = async (meetingCode) => {
    try {
      let request = await client.post("/add_to_activity", {
        token: localStorage.getItem("token"),
        meeting_code: meetingCode
      });
      return request
    } catch (e) {
      console.error("❌ Failed to add to history:", e.response ? e.response.data : e.message);
    }
  }

  return (
    <AuthContext.Provider value={{ userdata, setUserdata, addToUserHistory, getHistoryOfUser, handleRegister, handleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
