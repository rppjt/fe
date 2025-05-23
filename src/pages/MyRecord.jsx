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

  const handleClick = (id) => {
    navigate(`/my-records/${id}`);
  };

  const toggleRecommend = async (record) => {
    const token = localStorage.getItem("accessToken");
    const isRecommended = record.recommendedCourseId !== null;

    try {
      if (isRecommended) {
        // ⭐ 해제 요청 (추천 취소)
        await fetch(`http://localhost:8080/course/${record.recommendedCourseId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("🔙 추천 코스에서 삭제되었습니다");
        setRecords((prev) =>
          prev.map((r) =>
            r.id === record.id ? { ...r, recommendedCourseId: null } : r
          )
        );
      } else {
        // ⭐ 등록 요청
        const res = await fetch("http://localhost:8080/course", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: `기록 ${new Date(record.createdAt).toLocaleString()}`,
            distance: record.distance,
            pathGeoJson: JSON.parse(record.pathGeoJson),
          }),
        });

        if (!res.ok) throw new Error("추천 등록 실패");
        const data = await res.json();
        alert("✅ 추천 코스로 등록되었습니다");
        setRecords((prev) =>
          prev.map((r) =>
            r.id === record.id ? { ...r, recommendedCourseId: data.id } : r
          )
        );
      }
    } catch (err) {
      console.error("추천 토글 오류:", err);
    }
  };

  return (
    <div className={styles.container}>
      <h2>📜 나의 러닝 기록</h2>
      {records.length === 0 ? (
        <p>기록이 없습니다.</p>
      ) : (
        <ul className={styles.recordList}>
          {records.map((record) => (
            <li
              key={record.id}
              className={styles.recordItem}
              onClick={() => handleClick(record.id)}
            >
              <p>
                <strong>날짜:</strong>{" "}
                {new Date(record.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>거리:</strong> {record.distance} km
              </p>
              <p>
                <strong>시간:</strong>{" "}
                {Math.floor(record.time / 60)}분 {record.time % 60}초
              </p>
              <p>
                <strong>페이스:</strong> {record.pace}
              </p>
              <span
                onClick={(e) => {
                  e.stopPropagation(); // 기록 상세 이동 막기
                  toggleRecommend(record);
                }}
                style={{
                  cursor: "pointer",
                  fontSize: "20px",
                  color: record.recommendedCourseId ? "gold" : "#ccc",
                }}
              >
                ⭐
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyRecords;
//       <div className={styles.courseTitle}>{course.title}</div>