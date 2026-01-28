import { createContext, useState } from "react";

export const SuperAdminAuthContext = createContext();

export const SuperAdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("superadmin_token")
  );

  const login = (token) => {
    localStorage.setItem("superadmin_token", token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("superadmin_token");
    setToken(null);
  };

  return (
    <SuperAdminAuthContext.Provider value={{ token, login, logout }}>
      {children}
    </SuperAdminAuthContext.Provider>
  );
};
