// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState(null);

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
      // 🔽 사용자 정보 요청
      fetch("http://localhost:8080/user", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })  
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch((err) => {
          console.error("❌ 사용자 정보 불러오기 실패:", err);
          setUser(null);
          setIsAuthReady(true);
        });
    }
    setIsAuthReady(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{ accessToken, setAccessToken, user, setUser, isAuthReady }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
