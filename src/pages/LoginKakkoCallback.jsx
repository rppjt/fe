import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const LoginKakkoCallback = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const res = await fetch("http://localhost:8080/login/oauth2/code/kakao" + window.location.search, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("accessToken 재발급 실패");

        const data = await res.json();
        const accessToken = data.accessToken;

        if (accessToken) {
          setAccessToken(accessToken);
          navigate("/home");
        } else {
          throw new Error("accessToken이 없음");
        }
      } catch (err) {
        console.error("❌ 로그인 실패:", err);
        navigate("/");
      }
    };

    fetchAccessToken();
  }, [navigate, setAccessToken]);

  return <p>🔐 로그인 처리 중입니다...</p>;
};

export default LoginKakkoCallback;
