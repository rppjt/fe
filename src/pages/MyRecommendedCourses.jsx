// src/pages/MyRecommendedCourses.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/authFetch";
import styles from "./MyPage.module.css";

const MyRecommendedCourses = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const res = await authFetch("http://localhost:8080/course/my");
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("❌ 내가 만든 추천 코스 불러오기 실패:", err);
      }
    };

    fetchMyCourses();
  }, []);

  const handleClick = (id) => {
    navigate(`/course/${id}`);
  };

  return (
    <div>
      <h2>🏃 내가 만든 추천 코스</h2>
      {courses.length === 0 ? (
        <p>아직 등록한 추천 코스가 없습니다.</p>
      ) : (
        <ul className={styles.favoriteList}>
          {courses.map((course) => (
            <li
              key={course.id}
              onClick={() => handleClick(course.id)}
              className={styles.favoriteItem}
            >
              <p className={styles.courseTitle}>{course.title}</p>
              <p>{course.distance} km | ❤️ {course.likes}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyRecommendedCourses;
