// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState(null);

  const setAccessToken = (token) => {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
    setAccessTokenState(token);
  };

  useEffect(() => {
    const pathname = window.location.pathname;
    
    // ✅ 로그인 페이지(/ 또는 /login)에서는 자동 로그인 시도하지 않음
    if (pathname === "/" || pathname === "/login") return;

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

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
