// src/pages/LoginKakkoCallback.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LoginKakkoCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      console.error("❌ code 파라미터가 없습니다.");
      navigate("/");
      return;
    }

    const exchangeToken = async () => {
      try {
        const res = await fetch("http://localhost:8080/login/kakao/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          throw new Error("⚠️ 토큰 요청 실패");
        }

        const data = await res.json();
        const accessToken = data.accessToken;

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken); // ✅ 직접 저장
          navigate("/home");
        } else {
          console.error("❌ accessToken이 응답에 없습니다.");
          navigate("/");
        }
      } catch (err) {
        console.error("❌ 로그인 처리 중 오류:", err);
        navigate("/");
      }
    };

    exchangeToken();
  }, [navigate, searchParams]);

  return <div>🔐 로그인 처리 중입니다...</div>;
};

export default LoginKakkoCallback;
