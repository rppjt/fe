import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuthFetch } from "../utils/useAuthFetch";
import MapContainer from "../components/MapContainer";

const RunPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const courseId = searchParams.get("courseId");

  const [course, setCourse] = useState(null); // 코스 전체 정보
  const authFetch = useAuthFetch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ✅ 코스 정보 불러오기
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const res = await authFetch(`http://localhost:8080/course/${courseId}`);
        if (!res.ok) throw new Error("코스 정보 불러오기 실패");
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (courseId) fetchCourseDetail();
  }, [courseId]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🏃 추천 코스 따라 달리기</h2>
      {course && (
        <p>📍 <strong>{course.user?.name || course.user?.email}</strong> 님이 만든 코스입니다</p>
      )}
      <MapContainer courseId={courseId} />
    </div>
  );
};

export default RunPage;
