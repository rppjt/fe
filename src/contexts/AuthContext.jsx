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
  /*
  useEffect(() => {
    const pathname = window.location.pathname;
    
    if (pathname === "/" || pathname === "/login") return;

    // 자동 로그인 시도
    const tryRefresh = async () => {
      try {
        const res = await fetch("http://localhost:8080/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) throw new Error("refresh 실패");

        const data = await res.json();
        setAccessToken(data.access_token);
        console.log("✅ 자동 로그인 성공");
      } catch (err) {
        console.warn("❌ 자동 로그인 실패:", err);
        setAccessToken(null);
      }
    };

    tryRefresh();
  }, []);
  */
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
