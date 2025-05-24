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
        const res = await authFetch("http://localhost:8080/favorite");
        const data = await res.json();
        setFavorites(data);
      } catch (err) {
        console.error("❌ 즐겨찾기 목록 불러오기 실패:", err);
      }
    };

    fetchFavorites();
  }, []);

  const handleClick = (id) => {
    navigate(`/course/${id}`);
  };

  return (
    <div>
      <h2>⭐ 즐겨찾기한 코스</h2>
      {favorites.length === 0 ? (
        <p>아직 즐겨찾기한 코스가 없습니다.</p>
      ) : (
        <ul className={styles.favoriteList}>
          {favorites.map((course) => (
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

export default MyFavorites;
