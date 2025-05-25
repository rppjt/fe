// src/pages/Courses.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Courses.module.css";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("likes");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("http://localhost:8080/course");
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("코스 불러오기 실패:", err);
      }
    };

    fetchCourses();
  }, []);

  const handleClick = (id) => {
    navigate(`/course/${id}`);
  };

  // ✅ 필터링 + 정렬 처리
  const filteredCourses = courses
    .filter((course) =>
      (course.title + (course.description || "")).toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "likes") return b.likes - a.likes;
      if (sortOption === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOption === "distance") return a.distance - b.distance;
      return 0;
    });

  return (
    <div className={styles.container}>
      <h2>📚 추천 코스 전체 보기</h2>

      <div className={styles.controls}>
        <input
          type="text"
          placeholder="제목 또는 설명 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className={styles.sortSelect}
        >
          <option value="likes">❤️ 좋아요순</option>
          <option value="latest">🕒 최신순</option>
          <option value="distance">📏 거리순</option>
        </select>
      </div>

      {filteredCourses.length === 0 ? (
        <p>표시할 추천 코스가 없습니다.</p>
      ) : (
        <ul className={styles.courseList}>
          {filteredCourses.map((course) => (
            <li
              key={course.id}
              className={styles.courseItem}
              onClick={() => handleClick(course.id)}
            >
              <img
                src="/course-default-thumbnail.jpg"
                alt={course.title}
                className={styles.thumbnail}
              />
              <div className={styles.info}>
                <p className={styles.title}>{course.title}</p>
                <p>{course.distance} km | ❤️ {course.likes}</p>
                <p className={styles.description}>
                  {course.description || "설명이 없습니다."}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Courses;
