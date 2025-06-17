// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAuthFetch } from "../utils/useAuthFetch";
import LogoutButton from "../components/LogoutButton";
import MapContainer from "../components/MapContainer";
import styles from "./Home.module.css";

const Home = () => {
  const [user, setUser] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const { accessToken } = useAuth();
  const [popularCourses, setPopularCourses] = useState([]);

  useEffect(() => {
    if (!accessToken) return;

    const fetchUser = async () => {
      try {
        const res = await authFetch("http://localhost:8080/user");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("사용자 정보 가져오기 실패:", err);
      }
    };

    const fetchRecommendations = async () => {
      try {

        const res = await authFetch(
          `http://localhost:8080/course?sortType=LIKE`
        );
        const data = await res.json();

        const selected = data.slice(0, 3);
        setAllCourses(selected);
      } catch (err) {
        console.error("추천 코스 불러오기 실패:", err);
      }
    };

    const fetchPopularCourses = async () => {
      try {
        const res = await authFetch("http://localhost:8080/stats/popular-courses");
        const data = await res.json();
        setPopularCourses(data);
      } catch (err) {
        console.error("인기 코스 불러오기 실패:", err);
      }
    };

    fetchUser();
    fetchRecommendations();
    fetchPopularCourses();
  }, [accessToken]);

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

  const handleClickCourse = (id) => {
    navigate(`/course/${id}`);
  };

  const handleClickStats = (id) => {
    navigate(`/course-stats/${id}`);
  };

  if (!user) return <div>사용자 정보를 불러오는 중...</div>;

  return (
    <div className={styles.container}>
      <h1>
        <span
          onClick={() => navigate("/mypage")}
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

      {showRecoveryPrompt && (
        <div className={styles.recoveryBox}>
          <p>💾 저장되지 않은 기록이 있습니다. 복구하시겠습니까?</p>
          <button onClick={handleRecover}>✅ 복구</button>
          <button onClick={handleIgnore}>❌ 무시</button>
        </div>
      )}

      <div className={styles.recommendBox}>
        <h2>📌 추천 경로</h2>
        <div className={styles.recommendList}>
          {allCourses.map((course) => (
            <div
              key={course.id}
              className={styles.courseItem}
              onClick={() => handleClickCourse(course.id)}
            >
              <img
                src="/course-default-thumbnail.jpg"
                alt={course.endLocationName || "코스"}
                className={styles.thumbnail}
              />
              <div className={styles.courseInfo}>
                <p className={styles.endLocationName}>{course.endLocationName}</p>
                <p className={styles.likes}>❤️ {course.likes}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
          <button
            onClick={() => navigate("/courses")}
            className={styles.moreButton}
          >
            ➕ 더보기
          </button>
        </div>
      </div>
      <div className={styles.popularBox}>
        <h2>🔥 인기 추천 코스</h2>
        <div className={styles.popularGrid}>
          {popularCourses.slice(0, 10).map((course) => (
            <div
              key={course.courseId}
              className={styles.popularCard}
              onClick={() => handleClickStats(course.courseId)}
            >
              <p className={styles.popularTitle}>{course.courseTitle}</p>
              <p className={styles.popularInfo}>
                📏 {course.distanceKm}km | 👥 {course.uniqueRunnerCount}명
              </p>
              <p className={styles.popularStats}>
                🔥 {course.totalCompletionCount}회 | ⏱ {course.averagePace}분/km
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;