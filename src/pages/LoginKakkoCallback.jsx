// src/pages/LoginKakkoCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginKakkoCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const getToken = async () => {
      try {
        const response = await fetch("http://localhost:8080/oauth2/success", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();
        const { accessToken } = data;

        localStorage.setItem("accessToken", accessToken);

        // ✅ 로그인 성공 시 /home으로 이동
        navigate("/home");
      } catch (error) {
        console.error("로그인 실패", error);
      }
    };

    getToken();
  }, [navigate]);

  return <div>로그인 처리 중입니다...</div>;
};

export default LoginKakkoCallback;
