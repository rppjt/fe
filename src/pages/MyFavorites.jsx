// src/pages/MyFavorites.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/authFetch";
import styles from "./MyPage.module.css";

const MyFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await authFetch("http://localhost:8080/course/bookmark/my");
        const data = await res.json();
        setFavorites(data);
      } catch (err) {
        console.error("❌ 즐겨찾기한 코스 불러오기 실패:", err);
      }
    };

    fetchFavorites();
  }, []);

  const handleClick = (id) => {
    navigate(`/course/${id}`);
  };

  const toggleBookmark = async (courseId) => {
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(
        `http://localhost:8080/course/bookmark/${courseId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("즐겨찾기 해제 실패");

      // 삭제된 항목만 제외
      setFavorites((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error("❌ 즐겨찾기 토글 실패:", err);
    }
  };

  return (
    <div>
      <h2>⭐ 내가 즐겨찾기한 코스</h2>
      {favorites.length === 0 ? (
        <p>아직 즐겨찾기한 코스가 없습니다.</p>
      ) : (
        <ul className={styles.favoriteList}>
          {favorites.map((course) => (
            <li
              key={course.id}
              className={styles.favoriteItem}
              onClick={() => handleClick(course.id)}
            >
              <p className={styles.courseTitle}>{course.title}</p>
              <p>{course.distance} km | ❤️ {course.likes}</p>
              <p>{course.description || "설명이 없습니다."}</p>
              <img
                src={course.thumbnailUrl || "/course-default-thumbnail.jpg"}
                alt={course.title}
                className={styles.thumbnail}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(course.id);
                }}
              >
                ⭐ 즐겨찾기 해제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyFavorites;
