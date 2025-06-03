// src/components/statistics/WeeklyStatsCard.jsx
import React from "react";

const WeeklyStatsCard = ({ data }) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs}초`;
  };

  return (
    <div className="stat-card">
      <h3>🕒 주간 통계</h3>
      <p>총 로경: {data.totalRuns}회</p>
      <p>총 거리: {data.totalDistance}km</p>
      <p>총 시간: {formatTime(data.totalTime)}</p>
      <p>평균 페이스: {data.averagePace} 분/km</p>
      <p>평균 거리: {data.averageDistance}km</p>
      <p>복도: {data.startOfWeek} ~ {data.endOfWeek}</p>
    </div>
  );
};

export default WeeklyStatsCard;
