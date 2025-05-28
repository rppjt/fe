import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAuthFetch } from "../utils/useAuthFetch";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const authFetch = useAuthFetch();

  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  const fetchCourse = async () => {
    try {
      const res = await authFetch(`http://localhost:8080/course/${id}`);

      if (res.status === 401) {
        setError("로그인이 필요합니다.");
        return;
      }

      if (!res.ok) {
        throw new Error("응답 실패");
      }

      const data = await res.json();
      setCourse(data);
    } catch (err) {
      console.error("코스 정보 로딩 실패:", err);
      setError("코스 정보를 불러오는 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (!accessToken) {
      // 자동 로그인 시도 전 또는 비로그인 상태
      return;
    }
    fetchCourse();
  }, [accessToken]);

  if (!accessToken) {
    return <p>🔒 로그인 정보를 확인 중입니다...</p>;
  }

  if (error) {
    return (
      <div>
        <p>❌ {error}</p>
        <button onClick={() => navigate("/")}>홈으로 이동</button>
      </div>
    );
  }

  if (!course) {
    return <p>📦 코스 정보를 불러오는 중...</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🏁 {course.title}</h2>
      <p>📍 도착지: {course.endName}</p>
      <p>📏 거리: {course.distance} km</p>
      <p>❤️ 좋아요: {course.likes}</p>
      <p>📝 설명: {course.description || "설명이 없습니다."}</p>
    </div>
  );
};

export default CourseDetail;
