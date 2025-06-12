import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./course.module.css";
import { useAuthFetch } from "../utils/useAuthFetch"; // ✅ 인증된 fetch 훅

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("LIKE");
  const navigate = useNavigate();
  const authFetch = useAuthFetch();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await authFetch(
          `http://localhost:8080/course?sortType=${sortOption.toUpperCase()}`
        );
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("코스 불러오기 실패:", err);
      }
    };

    fetchCourses();
  }, [sortOption]);

  const handleClick = (id) => {
    if (id !== undefined) {
      navigate(`/course/${id}`);
    }
  };

  const toggleBookmark = async (courseId, isBookmarked) => {
    //co  nst token = localStorage.getItem("access_token");

    try {
      const res = await authFetch(
        `http://localhost:8080/course/bookmark/${courseId}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) throw new Error("즐겨찾기 요청 실패");

      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId ? { ...c, bookmarked: !isBookmarked } : c
        )
      );
    } catch (err) {
      console.error("즐겨찾기 실패:", err);
    }
  };


  const filteredCourses = courses.filter((course) =>
    (course.endLocationName + (course.description || ""))
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );


  return (
    <div className={styles.container}>
      <h2>📚 추천 코스 전체 보기</h2>

      <div className={styles.controls}>
        <input
          type="text"
          placeholder="목적지 또는 설명 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className={styles.sortSelect}
        >
          <option value="LIKE">❤️ 좋아요순</option>
          <option value="RECENT">🕒 최신순</option>
          <option value="DISTANCE">📏 거리순</option>
        </select>
      </div>

      {filteredCourses.length === 0 ? (
        <p>표시할 추천 코스가 없습니다.</p>
      ) : (
        <ul className={styles.courseList}>
          {filteredCourses.map((course) => (
            <li
              key={course.id || Math.random()}
              className={styles.courseItem}
              onClick={() => handleClick(course.id)}
            >
              <img
                src="/course-default-thumbnail.jpg"
                alt={course.endLocationName || "코스"}
                className={styles.thumbnail}
              />
              <div className={styles.info}>
                <p className={styles.endLocationName}>
                  {course.endLocationName || "목적지 미지정"}
                </p>
                <p>{course.totalDistance} km | ❤️ {course.likes}</p>
                <p className={styles.description}>
                  {course.description || "설명이 없습니다."}
                </p>

                {/* ✅ 즐겨찾기 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 상위 li 클릭 방지
                    toggleBookmark(course.id, course.bookmarked);
                  }}
                >
                  {course.bookmarked ? "⭐ 즐겨찾기 해제" : "☆ 즐겨찾기 추가"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Courses;