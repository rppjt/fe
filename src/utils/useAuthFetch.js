import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const useAuthFetch = () => {
  const { accessToken, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const maxRetry = 2;

  const authFetch = async (url, options = {}, retryCount = 0) => {
    let token = accessToken;

    // 🔁 토큰이 없으면 refresh 시도
    if (!token && retryCount === 0) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        token = refreshed;
        setAccessToken(refreshed);
      } else {
        console.warn("🚫 토큰 없음 + refresh 실패 → 로그아웃");
        setAccessToken(null);
        navigate("/");
        throw new Error("accessToken 없음 + refresh 실패");
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

    // 🔐 401 Unauthorized 처리
    if (res.status === 401 && retryCount < maxRetry) {
      const error = await res.json();

      if (error.code === "J001") {
        // ✅ accessToken 만료 → refresh 후 재요청
        const newToken = await tryRefreshToken();
        if (!newToken) {
          console.warn("❌ accessToken 재발급 실패");
          setAccessToken(null);
          navigate("/");
          throw new Error("accessToken 재발급 실패");
        }

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
      } else if (error.code === "J002") {
        // ❌ refreshToken 만료 → 강제 로그아웃
        console.warn("❌ refreshToken 만료, 재로그인 필요");
        setAccessToken(null);
        navigate("/");
        throw new Error("Refresh Token 만료");
      } else {
        // ❗ 기타 인증 오류
        console.warn("❌ 기타 인증 에러:", error.message);
        setAccessToken(null);
        navigate("/");
        throw new Error(error.message || "인증 실패");
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

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.warn("❌ refresh 실패:", err?.message);
        return null;
      }

      const data = await res.json();
      return data.accessToken || null;
    } catch (err) {
      console.error("🔁 refresh 요청 중 예외 발생", err);
      return null;
    }
  };

  return authFetch;
};
