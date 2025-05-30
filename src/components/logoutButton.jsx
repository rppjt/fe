// src/components/LogoutButton.jsx
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/authFetch";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authFetch("http://localhost:8080/auth/logout", {
        method: "POST",
      });

      localStorage.removeItem("accessToken");
      navigate("/");
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  return <button onClick={handleLogout}>로그아웃</button>;
};

export default LogoutButton;
