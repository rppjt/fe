// src/pages/LoginKakkoCallback.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LoginKakkoCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);

      // 2. URL에서 쿼리스트링 제거
      window.history.replaceState({}, "", "/login/callback");

      navigate("/home"); // ✅ 로그인 성공 시 이동
    } else {
      console.error("AccessToken이 존재하지 않습니다.");
    }
  }, [navigate, searchParams]);

  return <div>로그인 처리 중입니다...</div>;
};

export default LoginKakkoCallback;
