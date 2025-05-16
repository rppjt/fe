import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loginpage from "./pages/Loginpage";
import LoginKakaoCallback from "./pages/LoginKakkoCallback";
import Home from "./pages/home"; // ✅ 새로 만든 Home 페이지 import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Loginpage />} />
        <Route path="/login/kakao" element={<LoginKakaoCallback />} />
        <Route path="/home" element={<Home />} /> {/* ✅ 추가된 홈 경로 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
