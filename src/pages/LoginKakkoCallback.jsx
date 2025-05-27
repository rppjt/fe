import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const LoginKakkoCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAccessToken } = useAuth();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      console.error("❌ code 파라미터 없음");
      navigate("/");
      return;
    }

    const exchangeToken = async () => {
      try {
        const res = await fetch("http://localhost:8080/login/kakao/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
          credentials: "include", // ✅ refreshToken은 쿠키로 저장
        });

        if (!res.ok) throw new Error("accessToken 요청 실패");

        const data = await res.json();
        const accessToken = data.accessToken;

        if (accessToken) {
          setAccessToken(accessToken); // ✅ 전역 상태에 저장
          navigate("/home");
        } else {
          throw new Error("accessToken 없음");
        }
      } catch (err) {
        console.error("❌ 로그인 처리 실패:", err);
        navigate("/");
      }
    };

    exchangeToken();
  }, [navigate, setAccessToken, searchParams]);

  return <p>🔐 로그인 처리 중입니다...</p>;
};

export default LoginKakkoCallback;
