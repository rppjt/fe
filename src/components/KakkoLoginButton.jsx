import React from "react";
import "./KakkoLoginButton.css"; // 별도 CSS 파일 사용

const KakkoLoginButton = () => {
  const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const REDIRECT_URI = "http://localhost:5173/login/kakao";

  const handleLogin = () => {
    window.location.href =
      `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}` +
      `&redirect_uri=${REDIRECT_URI}&response_type=code`;
  };

  return (
    <button onClick={handleLogin} className="kakao-button">
      <img
        src="/kakkologo.png"
        alt="Kakao Login"
        className="kakao-login-img"
      />
    </button>
  );
};

export default KakkoLoginButton;
