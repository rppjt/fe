import React from "react";
import styles from "./PersonalStatsCard.module.css";


const formatDistance = (km) => {
  if (km === 0) return "0km";
  if (km < 1) return `${(km * 1000).toFixed(0)}m`;
  return `${km.toFixed(2)}km`;
};

const formatPace = (pace) => {
  if (pace === 0) return "기록 없음";
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}분 ${seconds.toString().padStart(2, '0')}초/km`;
};

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}시간 ${minutes}분 ${secs}초`;
  return `${minutes}분 ${secs}초`;
};

const formatBestMonth = (bestMonth) => {
  if (!bestMonth || typeof bestMonth !== "object") return "아직 기록 없음";

  const { month, activeDays } = bestMonth;
  if (month === 0) return "아직 기록 없음";

  const year = new Date().getFullYear();
  return `${year}년 ${month}월 (${activeDays}일)`;
};


const PersonalStatsCard = ({ data }) => {
  return (
    <div className={styles.statCard}>
  <h3>🏆 개인 기록</h3>
  <p>최장 거리: {formatDistance(data.longestDistance)}</p>
  <p>최고 속도: {formatPace(data.fastestPace)}</p>
  <p>최장 시간: {formatTime(data.longestTime)}</p>

  <hr />
  <h4>📌 누적 기록</h4>
  <p>총 거리: {formatDistance(data.totalDistance)}</p>
  <p>총 러닝 횟수: {data.totalRuns}회</p>

  <hr />
  <h4>🔥 올해 최고 활동</h4>
  <p>{formatBestMonth(data.bestMonth)}</p>
</div>

  );
};

export default PersonalStatsCard;