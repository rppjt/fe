// src/pages/home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/authFetch";
import LogoutButton from "../components/LogoutButton";
import MapContainer from "../components/MapContainer";
import styles from "./Home.module.css";

const Home = () => {
  const [user, setUser] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);

  const navigate = useNavigate();

  // ✅ 사용자 정보 가져오기
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

  // ✅ 추천 경로 가져오기
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const { latitude, longitude } = pos.coords;

        const res = await fetch(
          `http://localhost:8080/recommendations?lat=${latitude}&lng=${longitude}`
        );
        const data = await res.json();
        setAllCourses(data);
      } catch (err) {
        console.error("추천 코스 불러오기 실패:", err);
      }
    };
    fetchRecommendations();
  }, []);

  // ✅ 복구 알림 감지
  useEffect(() => {
    if (localStorage.getItem("unsavedRun")) {
      setShowRecoveryPrompt(true);
    }
  }, []);

  const handleRecover = () => {
    navigate("/recover");
  };

  const handleIgnore = () => {
    localStorage.removeItem("unsavedRun");
    setShowRecoveryPrompt(false);
  };

  const handleNext = () => {
    if (currentIndex + 3 < allCourses.length) {
      setCurrentIndex((prev) => prev + 3);
    }
  };

  const handlePrev = () => {
    if (currentIndex - 3 >= 0) {
      setCurrentIndex((prev) => prev - 3);
    }
  };

  const handleClickCourse = (id) => {
    navigate(`/course/${id}`);
  };

  const visibleCourses = allCourses.slice(currentIndex, currentIndex + 3);

  if (!user) return <div>사용자 정보를 불러오는 중...</div>;

  return (
    <div className={styles.container}>
      <h1>
        <span
          onClick={() => navigate("/my-records")}
          style={{
            textDecoration: "underline",
            cursor: "pointer",
            color: "#333",
          }}
        >
          {user.name || user.email}
        </span>{" "}
        님 환영합니다
      </h1>

      <p>level : {user.level}</p>
      <LogoutButton />
      <MapContainer />

      {/* 🔔 복구 알림 */}
      {showRecoveryPrompt && (
        <div className={styles.recoveryBox}>
          <p>💾 저장되지 않은 기록이 있습니다. 복구하시겠습니까?</p>
          <button onClick={handleRecover}>✅ 복구</button>
          <button onClick={handleIgnore}>❌ 무시</button>
        </div>
      )}

      {/* 📌 추천 경로 슬라이드 */}
      <div className={styles.recommendBox}>
        <h2>📌 추천 경로</h2>
        <div className={styles.recommendList}>
          {currentIndex > 0 && (
            <button className={styles.navButton} onClick={handlePrev}>
              ⬅️
            </button>
          )}

          {visibleCourses.map((course) => (
            <div
              key={course.id}
              className={styles.courseItem}
              onClick={() => handleClickCourse(course.id)}
            >
              <img
                src="/course-default-thumbnail.jpg"
                alt={course.title}
                className={styles.thumbnail}
              />
              <div className={styles.courseInfo}>
                <p className={styles.title}>{course.title}</p>
                <p className={styles.likes}>❤️ {course.likes}</p>
              </div>
            </div>
          ))}

          {currentIndex + 3 < allCourses.length && (
            <button className={styles.navButton} onClick={handleNext}>
              ➡️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
  