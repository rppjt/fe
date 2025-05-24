// src/pages/MyRecords.jsx
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

  const toggleFavorite = async (record) => {
    const token = localStorage.getItem("accessToken");
    const isFavorite = record.favorite === true;

    try {
      if (isFavorite) {
        // 즐겨찾기 해제
        await fetch(`http://localhost:8080/favorite/${record.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("⭐ 즐겨찾기에서 삭제되었습니다");
        setRecords((prev) =>
          prev.map((r) =>
            r.id === record.id ? { ...r, favorite: false } : r
          )
        );
      } else {
        // 즐겨찾기 추가
        await fetch(`http://localhost:8080/favorite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recordId: record.id }),
        });
        alert("⭐ 즐겨찾기에 추가되었습니다");
        setRecords((prev) =>
          prev.map((r) =>
            r.id === record.id ? { ...r, favorite: true } : r
          )
        );
      }
    } catch (err) {
      console.error("즐겨찾기 토글 오류:", err);
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
                  toggleFavorite(record);
                }}
                style={{
                  cursor: "pointer",
                  fontSize: "20px",
                  color: record.favorite ? "gold" : "#ccc",
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
