// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthReady, accessToken } = useAuth();

  if (!isAuthReady) return null; // 🔄 로딩 중엔 아무 것도 보여주지 않음
  if (!accessToken) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
