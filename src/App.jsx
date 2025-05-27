// src/App.jsx
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/Loginpage";
import LoginKakkoCallback from "./pages/LoginKakkoCallback";
import MyRecords from "./pages/MyRecords";
import DetailMyRecord from "./pages/DetailMyRecord";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import MyPage from "./pages/MyPage";
import { useAuth } from "./contexts/AuthContext.jsx";


function App() {
  const { setAccessToken } = useAuth();

  // ✅ 새로고침 시 토큰 복원 로직
  useEffect(() => {
    const restoreAccessToken = async () => {
      try {
        const res = await fetch("http://localhost:8080/auth/refresh", {
          method: "POST",
          credentials: "include", // ✅ refreshToken 쿠키 자동 전송
        });

        if (!res.ok) throw new Error("refresh 실패");

        const data = await res.json();
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          console.log("🔁 accessToken 복원 완료");
        } else {
          console.warn("❗accessToken이 응답에 없음");
        }
      } catch (err) {
        console.warn("🔁 자동 로그인 복원 실패:", err);
      }
    };

    restoreAccessToken();
  }, [setAccessToken]);

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login/oauth2/callback" element={<LoginKakkoCallback />} />
      <Route path="/my-records" element={<MyRecords />} />
      <Route path="/record/:id" element={<DetailMyRecord />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route path="/mypage" element={<MyPage />} />
    </Routes>
  );
}

export default App;
