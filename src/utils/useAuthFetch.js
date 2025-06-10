import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const useAuthFetch = () => {
  const { accessToken, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const maxRetry = 2;

  const authFetch = async (url, options = {}, retryCount = 0) => {
    let token = accessToken;

    // 토큰이 없으면 refresh 시도
    if (!token && retryCount === 0) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        token = refreshed;
        setAccessToken(token);
      } else {
        console.warn("🚫 토큰 없음 + refresh 실패 → 로그아웃");
        navigate("/");
        return;
      }
    }

    const config = {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token && { Authorization: `Bearer ${token}` }),
        "Content-Type": "application/json",
      },
      credentials: "include",
    };

    let res = await fetch(url, config);

    // 401일 경우 refresh 재시도
    if (res.status === 401 && retryCount < maxRetry) {
      try {
        const newToken = await tryRefreshToken();
        if (!newToken) throw new Error("새 토큰 없음");

        setAccessToken(newToken);

        const retryConfig = {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${newToken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        };

        return await authFetch(url, retryConfig, retryCount + 1);
      } catch (err) {
        console.error("❌ refresh 실패 또는 재요청 실패 → 로그아웃",err);
        navigate("/");
        throw err || new Error("authFetch 실패");
      }
    }

    return res;
  };

  // 🔁 refresh 요청 시도 함수
  const tryRefreshToken = async () => {
    try {
      const res = await fetch("http://localhost:8080/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) return null;

      const data = await res.json();
      return data.accessToken || null;
    } catch (err) {
      console.error("🔁 refresh 요청 중 예외 발생", err);
      return null;
    }
  };

  return authFetch;
};
