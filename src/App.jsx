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
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ 추가

function App() {
  return (
    <LocationProvider>
      <AppLayout>
        <Routes>
          {/* ❌ 로그인 관련 경로 (보호 안 함) */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login/callback" element={<LoginKakkoCallback />} />

          {/* ✅ 보호된 경로들 */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-records"
            element={
              <ProtectedRoute>
                <MyRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-records/:id"
            element={
              <ProtectedRoute>
                <DetailMyRecord />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:id"
            element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recover"
            element={
              <ProtectedRoute>
                <RecoverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/run"
            element={
              <ProtectedRoute>
                <RunPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppLayout>
    </LocationProvider>
  );
}

export default App;
