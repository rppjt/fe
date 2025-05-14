import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginKakaoCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    if (code) {
      fetch(`http://localhost:8080/login/oauth2/code/kakao?code=${code}`)
        .then(res => res.json())
        .then(data => {
          localStorage.setItem("access_token", data.token);
          localStorage.setItem("nickname", data.user.nickname);
          localStorage.setItem("profileImage", data.user.profileImage);
          navigate("/login"); // 로그인 완료 페이지
        })
        .catch(() => {
          alert("로그인 실패");
          navigate("/");
        });
    }
  }, [navigate]);

  return <div>로그인 처리 중입니다...</div>;
};

export default LoginKakaoCallback;
