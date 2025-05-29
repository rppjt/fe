// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/Loginpage";
import LoginKakkoCallback from "./pages/LoginKakkoCallback";
import MyRecords from "./pages/MyRecords";
import DetailMyRecord from "./pages/DetailMyRecord";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import MyPage from "./pages/MyPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login/callback" element={<LoginKakkoCallback />} />
      <Route path="/my-records" element={<MyRecords />} />
      <Route path="/record/:id" element={<DetailMyRecord />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/course/:id" element={<CourseDetail />} />
      <Route path="/mypage" element={<MyPage />} />
    </Routes>
  );
}

export default App;
