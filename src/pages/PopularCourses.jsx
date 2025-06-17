// src/pages/PopularCourses.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./popularCourses.module.css";
import { useAuthFetch } from "../utils/useAuthFetch";

const PopularCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const authFetch = useAuthFetch();

  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        const res = await authFetch("http://localhost:8080/stats/popular-courses");
        if (!res.ok) throw new Error("인기 코스 조회 실패");
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCourses();
  }, []);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>❌ {error}</p>;

  return (
    <div className={styles.container}>
      <h2>🔥 인기 추천 코스</h2>
      <div className={styles.courseList}>
        {courses.map((course) => (
          <div
            key={course.courseId}
            className={styles.courseCard}
            onClick={() => navigate(`/course-stats/${course.courseId}`)}
          >
            <h3>{course.courseTitle}</h3>
            <p>👤 {course.creatorName}</p>
            <p>📏 {course.distanceKm}km</p>
            <p>🔥 완주 {course.totalCompletionCount}회</p>
            <p>👥 {course.uniqueRunnerCount}명 참여</p>
            <p>⏱ 평균 페이스 {course.averagePace}분/km</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularCourses;
