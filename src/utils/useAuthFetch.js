
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export const useAuthFetch = () => {
  const { accessToken, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const authFetch = async (url, options = {}) => {
    let token = accessToken;

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
        const newToken = data.accessToken;

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
        console.error("🔐 자동 로그인 실패", err);
        navigate("/");
        throw err;
      }
    }

    return res;
  };

  return authFetch;
};
