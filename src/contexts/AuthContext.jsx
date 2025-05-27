import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);

  // ✅ 앱 시작 시 refresh token으로 accessToken 갱신
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await fetch("http://localhost:8080/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) throw new Error("refresh 실패");

        const data = await res.json();
        setAccessToken(data.accessToken);
        console.log("✅ 자동 로그인 성공");
      } catch (err) {
        console.warn("❌ 자동 로그인 실패:", err);
        setAccessToken(null); // 명시적으로 초기화
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
