// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authFetch("http://localhost:8080/api/user/me");
        if (!response.ok) throw new Error("사용자 정보 가져오기 실패");

        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error("유저 정보 요청 실패:", err);
      }
    };

    fetchUser();
  }, []);

  if (!user) return <div>사용자 정보를 불러오는 중...</div>;

  return (
    <div>
      <h1>안녕하세요, {user.name}님!</h1>
      <img src={user.profileImage} alt="프로필" width="80" style={{ borderRadius: "50%" }} />
      <p>이메일: {user.email}</p>
      <p>레벨: {user.level}</p>
      <p>경험치: {user.experiencePoints}</p>
    </div>
  );
};

export default Home;
