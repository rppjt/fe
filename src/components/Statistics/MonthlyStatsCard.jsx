// src/components/statistics/MonthlyStatsCard.jsx
import React from "react";

const MonthlyStatsCard = ({ data }) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs}초`;
  };

  return (
    <div className="stat-card">
      <h3>📅 월간 통계</h3>
      <p>총 로경: {data.totalRuns}회</p>
      <p>총 거리: {data.totalDistance}km</p>
      <p>총 시간: {formatTime(data.totalTime)}</p>
      <p>평균 페이스: {data.averagePace} 분/km</p>
      <p>평균 거리: {data.averageDistance}km</p>
      <p>활동 일수: {data.activeDays}일</p>
      <p>최장 로경: {data.longestRun}km</p>
      <p>최고 속도: {data.fastestPace} 분/km</p>
      <p>일자: {data.year}년 {data.month}월</p>
    </div>
  );
};

export default MonthlyStatsCard;
