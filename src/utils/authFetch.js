// src/utils/useAuthFetch.js
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const useAuthFetch = () => {
  const { access_token, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const authFetch = async (url, options = {}) => {
    // accessToken이 없으면 요청 중단
    if (!access_token) {
      console.warn("❗accessToken 없음, 요청 막음");
      return;
    }

    let token = access_token;

    const defaultHeaders = {
      ...(token && { Authorization: `Bearer ${token}` }),
      "Content-Type": "application/json",
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
      credentials: "include",
    };

    let res = await fetch(url, config);

    if (res.status === 401) {
      try {
        const refreshRes = await fetch("http://localhost:8080/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!refreshRes.ok) throw new Error("refresh 실패");

        const data = await refreshRes.json();
        const newToken = data.access_token;

        if (!newToken) throw new Error("accessToken 없음");

        setAccessToken(newToken);

        const retryConfig = {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          },
        };

        res = await fetch(url, retryConfig);
      } catch (err) {
        console.error("🔐 자동 로그인 실패, 로그아웃 필요:", err);
        navigate("/");
        throw err;
      }
    }

    return res;
  };

  return authFetch;
};