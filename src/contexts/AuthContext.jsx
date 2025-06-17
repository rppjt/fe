// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState(() => localStorage.getItem("accessToken"));
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
      setUser(null);
      setIsAuthReady(true);
      return;
    }

    setAccessToken(token);

    // ✅ 여기서는 authFetch 대신 직접 fetch 사용해야 함
    fetch("http://localhost:8080/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("유저 응답 실패");
        return res.json();
      })
      .then((data) => {
        console.log("✅ 사용자 정보 불러오기 성공:", data);
        setUser(data);
        setIsAuthReady(true);
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
