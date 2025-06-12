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
    if (!token) {
      setIsAuthReady(true); // 토큰 없으면 바로 true
      return;
    }

    setAccessToken(token);
    fetch("http://localhost:8080/user", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("유저 응답 실패");
        return res.json();
      })
      .then((data) => {
        console.log("✅ 사용자 정보 불러오기 성공:", data);
        setUser(data);
        setIsAuthReady(true); // 🔥 반드시 setUser 이후
      })
      .catch((err) => {
        console.error("❌ 사용자 정보 로딩 실패:", err);
        setUser(null);
        setIsAuthReady(true);
      });
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
