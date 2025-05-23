import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loginpage from "./pages/Loginpage";
import LoginKakaoCallback from "./pages/LoginKakkoCallback";
import Home from "./pages/Home";
import DetailMyRecord from "./pages/DetailMyRecord";
import CourseDetail from "./pages/CourseDetail";

function App() {  
  return (
    <BrowserRouter>
      <Routes>
        {/* 첫 진입 시 home 페이지로 렌더링 */}
        <Route path="/" element={<Loginpage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login/callback" element={<LoginKakaoCallback />} />
        <Route path="/my-records/:id" element={<DetailMyRecord />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/recover" element={<RecoverPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
