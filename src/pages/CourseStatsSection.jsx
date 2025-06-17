// src/pages/CourseStats.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./courseStats.module.css";

const CourseStats = () => {
  const { courseId } = useParams();
  const { accessToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/stats/recommended-course/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!res.ok) throw new Error("통계 로딩 실패");

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("❌ 코스 통계 불러오기 실패:", err);
        setError("통계를 불러오지 못했습니다.");
      }
    };

    fetchStats();
  }, [courseId, accessToken]);

  if (error) return <p>{error}</p>;
  if (!stats) return <p>📡 통계를 불러오는 중...</p>;

  const myRank = stats.topRunners.findIndex(
    (r) => r.runnerName === stats.myName
  ) + 1;

  return (
    <div className={styles.container}>
      <h2>{stats.courseTitle}</h2>
      <p>👤 생성자: {stats.creatorName}</p>
      <p>📏 거리: {stats.courseDistanceKm}km</p>

      <div className={styles.statsBox}>
        <p>🔥 전체 완주 수: {stats.totalCompletionCount}회</p>
        <p>👥 참여자 수: {stats.uniqueRunnerCount}명</p>
        <p>⏱️ 평균 완주 시간: {(stats.averageCompletionTimeSeconds / 60).toFixed(1)}분</p>
        <p>🏃 평균 페이스: {stats.averagePace}분/km</p>
      </div>

      <div className={styles.myStats}>
        <h3>내 기록</h3>
        <p>✅ 내 완주 수: {stats.myCompletionCount}회</p>
        <p>🥇 내 최고 기록: {stats.myBestTimeSeconds ? (stats.myBestTimeSeconds / 60).toFixed(1) + "분" : "-"}</p>
        <p>⏱️ 내 평균 페이스: {stats.myAveragePace || "-"}분/km</p>
        <p>📊 내 순위: {myRank > 0 ? `${myRank}위` : "순위권 밖"}</p>
      </div>

      <div className={styles.ranking}>
        <h3>🏆 TOP 5 러너</h3>
        <ul>
          {stats.topRunners.map((runner, idx) => (
            <li key={idx}>
              {idx + 1}위 - {runner.runnerName} | {runner.bestCompletionTimeSeconds / 60}분 | {runner.bestPace}분/km
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CourseStats;
