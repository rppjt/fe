import React from "react";
import "./KakkoLoginButton.css"; // 별도 CSS 파일 사용

const KakkoLoginButton = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
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
