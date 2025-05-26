import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// ✅ hook 기반 fetch 래퍼
export const useAuthFetch = () => {
  const { accessToken, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const authFetch = async (url, options = {}) => {
    // 1. accessToken 설정
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
      credentials: "include", // ✅ 쿠키 포함
    };

    // 2. 요청 시도
    let res = await fetch(url, config);

    // 3. 만약 401이면 → refresh 시도
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

        // 🔁 새 토큰 저장
        setAccessToken(newToken);

        // 🟢 원래 요청 다시 재시도
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
        navigate("/"); // 로그인 페이지로
        throw err;
      }
    }

    return res;
  };

  return authFetch;
};
