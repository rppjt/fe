import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import LoginKakaoCallback from "./pages/LoginKakkoCallback";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login/kakao" element={<LoginKakaoCallback />} />
        {/* 로그인 성공 후 리디렉션되는 페이지 추가 가능 */}
        <Route path="/login" element={<div>로그인 완료!</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
