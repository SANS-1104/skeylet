// // file: src/pages/Navbar/AuthContext.js

// import React, { createContext, useState, useEffect } from "react";
// import axiosClient from "../api/axiosClient";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
//   const [name, setName] = useState(localStorage.getItem("name") || "");
//   const [profile, setProfile] = useState(null);

//   const login = (accessToken, refreshToken, name) => {
//     // console.log("🔐 Setting token in localStorage:", accessToken); // ADD THIS
//     localStorage.setItem("token", accessToken);
//     localStorage.setItem("refreshToken", refreshToken); 
//     localStorage.setItem("name", name);
//     setIsLoggedIn(true);
//     setName(name);
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("refreshToken"); 
//     localStorage.removeItem("name");
//     setName("");
//     setIsLoggedIn(false);
//     setProfile(null);
//   };

//   const [authLoaded, setAuthLoaded] = useState(false);

// useEffect(() => {
//   const syncAuth = async () => {
//     try {
//       const res = await axiosClient.get("/profile");
//       if (res?.data) {
//         setProfile(res.data);
//         setName(res.data.name);
//         setIsLoggedIn(true);
//       }
//     } catch (err) {
//       setIsLoggedIn(false);
//       setProfile(null);
//     } finally {
//       setAuthLoaded(true); // <-- mark auth as loaded
//     }
//   };

//   const token = localStorage.getItem("token");
//   if (token) syncAuth();
//   else setAuthLoaded(true);

//   const onStorageChange = () => setIsLoggedIn(!!localStorage.getItem("token"));
//   window.addEventListener("storage", onStorageChange);
//   return () => window.removeEventListener("storage", onStorageChange);
// }, []);



//   useEffect(() => {
//     const syncAuth = async () => {
//       try {
//         const res = await axiosClient.get("/profile");
//         if (res?.data) {
//           setProfile(res.data);
//           setName(res.data.name);
//           setIsLoggedIn(true);
//         }
//       } catch (err) {
//         // console.warn("❌ syncAuth failed:", err?.response?.data?.msg || err.message);
//         setIsLoggedIn(false);
//         setProfile(null);
//       }
//     };

//     const token = localStorage.getItem("token");
//     if (token) syncAuth();

//     const onStorageChange = () => setIsLoggedIn(!!localStorage.getItem("token"));
//     window.addEventListener("storage", onStorageChange);
//     return () => window.removeEventListener("storage", onStorageChange);
//   }, []);


//   return (
//     <AuthContext.Provider
//       value={{
//         isLoggedIn,
//         name,
//         login,
//         logout,
//         profile, // shared globally now
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };



// file: src/pages/Navbar/AuthContext.js

import React, { createContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [profile, setProfile] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  const login = (accessToken, refreshToken, name) => {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("name", name);
    setIsLoggedIn(true);
    setName(name);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("name");
    setName("");
    setIsLoggedIn(false);
    setProfile(null);
  };

  // 🔹 Force verify pending payment
  const verifyPendingPayment = async (userId) => {
    try {
      for (let i = 0; i < 2; i++) {
        const res = await axiosClient.get(`/payments/verify-latest/${userId}`);

        if (res.data.status === "ACTIVE") {
          toast.success("🎉 Subscription Activated Successfully!");
          return true;
        }
      }
    } catch (err) {
      console.error("❌ verifyPendingPayment error:", err);
    }
    return false;
  };

  // 🔹 Sync profile + verify pending payment
  const syncAuth = async () => {
    try {
      const res = await axiosClient.get("/profile");
      if (res?.data) {
        setProfile(res.data);
        setName(res.data.name);
        setIsLoggedIn(true);

        // 🔥 Check & fix pending subscription
        if (res.data._id) {
          await verifyPendingPayment(res.data._id);
          const updated = await axiosClient.get("/profile");
          setProfile(updated.data);
        }
      }
    } catch (err) {
      setIsLoggedIn(false);
      setProfile(null);
    } finally {
      setAuthLoaded(true);
    }
  };

  // 🔹 Run syncAuth on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) syncAuth();
    else setAuthLoaded(true);

    const onStorageChange = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        name,
        login,
        logout,
        profile,
        authLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
