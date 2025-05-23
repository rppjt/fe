// src/pages/myRecords.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyRecords.module.css";

const MyRecords = () => {
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("http://localhost:8080/running-record", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("데이터 로딩 실패");

        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error("❌ 기록 불러오기 오류:", err);
      }
    };

    fetchRecords();
  }, []);

  const toggleFavorite = async (recordId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:8080/courses/like/${recordId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("추천 토글 실패");

      // 응답 받은 좋아요 수 or 상태 반영
      const updated = await res.json();
      setRecords((prev) =>
        prev.map((r) =>
          r.id === recordId ? { ...r, liked: !r.liked, likes: updated.likes } : r
        )
      );
    } catch (err) {
      console.error("⭐ 추천 토글 실패:", err);
    }
  };

  const handleClick = (id) => {
    navigate(`/my-records/${id}`);
  };

  return (
    <div className={styles.container}>
      <h2>📜 나의 러닝 기록</h2>
      {records.length === 0 ? (
        <p>기록이 없습니다.</p>
      ) : (
        <ul className={styles.recordList}>
          {records.map((record) => (
            <li key={record.id} className={styles.recordItem}>
              <div onClick={() => handleClick(record.id)}>
                <p><strong>날짜:</strong> {new Date(record.createdAt).toLocaleDateString()}</p>
                <p><strong>거리:</strong> {record.distance} km</p>
                <p><strong>시간:</strong> {Math.floor(record.time / 60)}분 {record.time % 60}초</p>
                <p><strong>페이스:</strong> {record.pace}</p>
              </div>
              <button
                className={styles.starButton}
                onClick={() => toggleFavorite(record.id)}
              >
                {record.liked ? "⭐" : "☆"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyRecords;
