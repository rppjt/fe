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
import RecoverPage from "./pages/RecoverPage";
import RunPage from "./pages/RunPage";
import AppLayout from "./components/AppLayout";
import { LocationProvider } from "./contexts/LocationContext";

function App() {
  return (
    <LocationProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login/callback" element={<LoginKakkoCallback />} />
          <Route path="/my-records" element={<MyRecords />} />
          <Route path="/my-records/:id" element={<DetailMyRecord />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/recover" element={<RecoverPage />} />
          <Route path="/run" element={<RunPage />} />
        </Routes>
      </AppLayout>
    </LocationProvider>
  );
}

export default App;
