import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const useAuthFetch = () => {
  const { accessToken, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const maxRetry = 2;

  const authFetch = async (url, options = {}, retryCount = 0) => {
    let token = accessToken;

    // token이 없으면 refresh 시도
    if (!token && retryCount === 0) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        token = refreshed;
        setAccessToken(token);
      } else {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
        throw new Error("accessToken 없음 + refresh 실패");
      }
    }

    const isFormData = options.body instanceof FormData;
    const config = {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(!isFormData && { "Content-Type": "application/json" }),
      },
      credentials: "include",
    };

    const res = await fetch(url, config);

    // 401: 토큰 만료 → refresh 시도
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
            ...(!isFormData && { "Content-Type": "application/json" }),
          },
          credentials: "include",
        };

        return await authFetch(url, retryConfig, retryCount + 1);
      } catch (err) {
        console.error("❌ refresh 실패 또는 재요청 실패 → 로그아웃", err);
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
        throw err || new Error("authFetch 실패");
      }
    }

    // 다른 에러 처리
    if (!res.ok) {
      try {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP ${res.status} 에러 발생`);
      } catch (parseError) {
        console.error('응답 파싱 실패:', parseError);
        throw new Error(`HTTP ${res.status}: 응답 파싱 실패`);
      }
    }

    return res;
  };

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

