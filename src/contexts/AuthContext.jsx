// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);


  const setAccessToken = (token) => {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
    setAccessTokenState(token);
  };
 useEffect(() => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    setAccessToken(token);
  }
  setIsAuthReady(true); // 복원 완료
  }, []);

  return (
      <AuthContext.Provider value={{ accessToken, setAccessToken, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
