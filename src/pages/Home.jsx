import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/authFetch";
import LogoutButton from "../components/LogoutButton";
import MapContainer from "../components/MapContainer";
import styles from "./Home.module.css";

const Home = () => {
  const [user, setUser] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
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

  // ✅ 추천 코스 중 좋아요 상위 → 랜덤 3개 표시
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

        // 좋아요 순 정렬 후 상위 10개 중 랜덤 3개 선택
        const topLiked = data.sort((a, b) => b.likes - a.likes).slice(0, 10);
        const shuffled = topLiked.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        setAllCourses(selected);
      } catch (err) {
        console.error("추천 코스 불러오기 실패:", err);
      }
    };
    fetchRecommendations();
  }, []);

  // ✅ 복구 기록 감지
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

      {/* 🔔 복구 알림 */}
      {showRecoveryPrompt && (
        <div className={styles.recoveryBox}>
          <p>💾 저장되지 않은 기록이 있습니다. 복구하시겠습니까?</p>
          <button onClick={handleRecover}>✅ 복구</button>
          <button onClick={handleIgnore}>❌ 무시</button>
        </div>
      )}

      {/* 📌 추천 경로 영역 */}
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
                alt={course.title}
                className={styles.thumbnail}
              />
              <div className={styles.courseInfo}>
                <p className={styles.title}>{course.title}</p>
                <p className={styles.likes}>❤️ {course.likes}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ➕ 더보기 버튼 */}
        <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
          <button
            onClick={() => navigate("/courses")}
            className={styles.moreButton}
          >
            ➕ 더보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
