// src/pages/home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/authFetch";
import LogoutButton from "../components/LogoutButton";
import MapContainer from "../components/MapContainer";
import styles from "./Home.module.css";

const Home = () => {
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

  // ✅ 사용자 정보
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

  // ✅ 추천 경로
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const { latitude, longitude } = pos.coords;

        const res = await fetch(
          `http://localhost:8080/recommendations?lat=${latitude}&lng=${longitude}&page=${page}&size=3`
        );
        if (!res.ok) throw new Error("추천 코스 불러오기 실패");
        const data = await res.json();

        if (data.length === 0) {
          setHasMore(false);
        } else {
          setRecommendations((prev) => [...prev, ...data]);
        }
      } catch (err) {
        console.error("❌ 추천 코스 오류:", err);
        alert("추천 코스를 불러오는 중 오류 발생");
      }
    };

    fetchRecommendations();
  }, [page]);

  const handleNext = () => {
    if (hasMore) setPage((prev) => prev + 1);
  };

  const handleClickCourse = (id) => {
    navigate(`/courses/${id}`);
  };

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

      {/* ✅ 지도 */}
      <MapContainer />

      {/* ✅ 추천 경로 섹션 */}
      <div className={styles.recommendBox}>
        <h2>📌 추천 경로</h2>
        <div className={styles.recommendList}>
          {recommendations.map((course) => (
            <div
              key={course.id}
              className={styles.courseItem}
              onClick={() => handleClickCourse(course.id)}
            >
              <img
                src="/course-default-thumbnail.jpg" // 임시 썸네일
                alt={course.title}
                className={styles.thumbnail}
              />
              <p>{course.title}</p>
            </div>
          ))}
          {hasMore && (
            <button onClick={handleNext} className={styles.nextButton}>
              ➡️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
