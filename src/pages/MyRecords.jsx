import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./myRecords.module.css";
import { useAuthFetch } from "../utils/useAuthFetch";
import { useAuth } from "../contexts/AuthContext.jsx";
import PersonalStatsCard from "../components/Statistics/PersonalStatsCard";
import WeeklyStatsCard from "../components/Statistics/WeeklyStatsCard";
import MonthlyStatsCard from "../components/Statistics/MonthlyStatsCard";

const MyRecords = () => {
  const [records, setRecords] = useState([]);
  const [personalStats, setPersonalStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const { isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;

    const fetchAllStats = async () => {
      try {
        const [res1, res2, res3] = await Promise.all([
          authFetch("http://localhost:8080/stats/personal-best"),
          authFetch("http://localhost:8080/stats/weekly"),
          authFetch("http://localhost:8080/stats/monthly")
        ]);

        if (!res1.ok || !res2.ok || !res3.ok) throw new Error("통계 API 실패");

        const data1 = await res1.json();
        const data2 = await res2.json();
        const data3 = await res3.json();

        setPersonalStats(data1);
        setWeeklyStats(data2);
        setMonthlyStats(data3);
      } catch (err) {
        console.error("❌ 통계 불러오기 오류:", err);
      }
    };

    const fetchRecords = async () => {
      try {
        const res = await authFetch("http://localhost:8080/running-record");

        if (!res.ok) throw new Error("데이터 로딩 실패");

        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error("❌ 기록 불러오기 오류:", err);
      }
    };

    fetchAllStats();
    fetchRecords();
  }, [isAuthReady]);

  const handleClick = (id) => {
    navigate(`/my-records/${id}`);
  };
  
  return (
    <div className={styles.container}>
      <h2>📊 나의 통계</h2>
      <div className={styles.statsRow}>
        {personalStats && <PersonalStatsCard data={personalStats} />}
        {weeklyStats && <WeeklyStatsCard data={weeklyStats} />}
        {monthlyStats && <MonthlyStatsCard data={monthlyStats} />}
      </div>
      <h2 style={{ marginTop: "2rem" }}>📜 나의 러닝 기록</h2>
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
              <p><strong>날짜:</strong> {new Date(record.createAt).toLocaleDateString()}</p>
              <p><strong>거리:</strong> {record.totalDistance} km</p>
              <p><strong>시간:</strong> {Math.floor(record.totalTime / 60)}분 {record.totalTime % 60}초</p>
              <p><strong>페이스:</strong> {record.pace}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyRecords;
