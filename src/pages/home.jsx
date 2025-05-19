// src/pages/home.jsx
import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import LogoutButton from "../components/logoutbutton";
import MapContainer from "../components/mapContainer";

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authFetch("http://localhost:8080/user");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("사용자 정보 가져오기 실패:", err);
      }
    };

    fetchUser();
  }, []);

  if (!user) return <div>사용자 정보를 불러오는 중...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>안녕하세요, {user.name}님!</h1>
      <p>level : {user.level}</p>
      <LogoutButton />
      <MapContainer />
    </div>
    
  );
};

export default Home;