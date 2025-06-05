import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAuthFetch } from "../utils/useAuthFetch";
import styles from "./courseDetail.module.css"; // ✅ CSS 모듈 적용

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const authFetch = useAuthFetch();

  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  const fetchCourse = async () => {
    try {
      const res = await authFetch(`http://localhost:8080/course/${id}`);
      if (res.status === 401) {
        setError("로그인이 필요합니다.");
        return;
      }
      if (!res.ok) throw new Error("응답 실패");
      const data = await res.json();
      setCourse(data);
    } catch (err) {
      console.error("코스 정보 로딩 실패:", err);
      setError("코스 정보를 불러오는 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (accessToken) fetchCourse();
  }, [accessToken]);

  const toggleLike = async () => {
    try {
      const res = await authFetch(`http://localhost:8080/like/${id}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("좋아요 요청 실패");

      setCourse((prev) => {
        if (!prev || typeof prev.isLiked !== "boolean") return prev;
        const newLiked = !prev.isLiked;
        const newCount = newLiked ? prev.likeCount + 1 : prev.likeCount - 1;
        return {
          ...prev,
          isLiked: newLiked,
          likeCount: newCount,
        };
      });
    } catch (err) {
      console.error("좋아요 실패:", err);
    }
  };

  const toggleBookmark = async () => {
    try {
      const res = await authFetch(`http://localhost:8080/course/bookmark/${id}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("북마크 요청 실패");

      setCourse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          isBookmarked: !prev.isBookmarked,
        };
      });
    } catch (err) {
      console.error("북마크 실패:", err);
    }
  };

  if (!accessToken) return <p>🔒 로그인 정보를 확인 중입니다...</p>;
  if (error) return <div><p>❌ {error}</p><button onClick={() => navigate("/")}>홈으로</button></div>;
  if (!course) return <p>📦 코스 정보를 불러오는 중...</p>;

  return (
    <div className={styles.container}>
      <h2>🏁 {course.title}</h2>
      <p>📍 도착지: {course.endLocationName}</p>
      <p>📏 거리: {course.totalDistance} km</p>
      <p>❤️ 좋아요: {course.likeCount}</p>
      <p>📝 설명: {course.description || "설명이 없습니다."}</p>

      <div className={styles.buttonGroup}>
        <button onClick={toggleLike} className={styles.likeButton}>
          {course.isLiked ? "❤️ 좋아요 취소" : "🤍 좋아요"}
        </button>
        <button onClick={toggleBookmark} className={styles.bookmarkButton}>
          {course.isBookmarked ? "⭐ 즐겨찾기 해제" : "☆ 즐겨찾기 추가"}
        </button>
        <button
          className={styles.followButton}
          onClick={() => navigate(`/run?courseId=${course.id}`)}
        >
          ▶️ 따라가기
        </button>
      </div>
    </div>
  );
};

export default CourseDetail;
