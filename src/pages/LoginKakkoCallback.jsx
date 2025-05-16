import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginKakkoCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // accessToken 받아오기
    const getToken = async () => {
      try {
        const response = await fetch("http://localhost:8080/oauth2/success", {
          method: "GET",
          credentials: "include", // ✅ refresh_token 쿠키 자동 포함
        });

        if (!response.ok) {
          throw new Error("로그인 실패");
        }

        const data = await response.json();
        const { accessToken } = data;

        // ✅ accessToken localStorage에 저장
        localStorage.setItem("accessToken", accessToken);

        // ✅ 메인 페이지로 이동
        navigate("/home");
      } catch (error) {
        console.error("로그인 처리 중 오류:", error);
        alert("로그인에 실패했습니다.");
      }
    };

    getToken();
  }, [navigate]);

  return <div>로그인 처리 중입니다...</div>;
};

export default LoginKakkoCallback;
