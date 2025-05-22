import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loginpage from "./pages/Loginpage";
import LoginKakaoCallback from "./pages/LoginKakkoCallback";
import Home from "./pages/Home";
import DetailMyRecord from "./pages/DetailMyRecord";

function App() {  
  return (
    <BrowserRouter>
      <Routes>
        {/* 첫 진입 시 home 페이지로 렌더링 */}
        <Route path="/" element={<Loginpage />} />         // 진입 시 로그인 페이지
        <Route path="/home" element={<Home />} />          // 로그인 후 Home 화면
        <Route path="/login/callback" element={<LoginKakaoCallback />} />
        <Route path="/my-records/:id" element={<DetailMyRecord />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
