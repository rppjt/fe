// src/pages/myRecords.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./myRecords.module.css";

const MyRecords = () => {
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("http://localhost:8080/api/runs/me", {
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
              <p><strong>날짜:</strong> {new Date(record.createdAt).toLocaleDateString()}</p>
              <p><strong>거리:</strong> {record.distance} km</p>
              <p><strong>시간:</strong> {Math.floor(record.time / 60)}분 {record.time % 60}초</p>
              <p><strong>페이스:</strong> {record.pace}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyRecords;
