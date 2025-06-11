import { useEffect, useState } from "react";
import PersonalStatsCard from "./PersonalStatsCard";
import WeeklyStatsCard from "./WeeklyStatsCard";
import MonthlyStatsCard from "./MonthlyStatsCard";
import { useAuthFetch } from "../../utils/useAuthFetch";
import styles from "./StatisticsSection.module.css";

const StatisticsSection = () => {
  const authFetch = useAuthFetch();

  const [personalStats, setPersonalStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [personalRes, weeklyRes, monthlyRes] = await Promise.all([
          authFetch("http://localhost:8080/stats/personal-best"),
          authFetch("http://localhost:8080/stats/weekly"),
          authFetch("http://localhost:8080/stats/monthly")
        ]);

        const personalData = await personalRes.json();
        const weeklyData = await weeklyRes.json();
        const monthlyData = await monthlyRes.json();

        console.log("🟡 weeklyData:", weeklyData);

        setPersonalStats(personalData);
        setWeeklyStats(weeklyData);
        setMonthlyStats(monthlyData);
      } catch (err) {
        console.error("📉 통계 데이터 로딩 실패:", err);
      }
    };

    fetchStats();
  }, []);

  if (!personalStats || !weeklyStats || !monthlyStats) {
    return <p>📊 통계 데이터를 불러오는 중...</p>;
  }

  return (
    <div className={styles.statisticsSection}>
      <PersonalStatsCard data={personalStats} />
      <WeeklyStatsCard data={weeklyStats} />
      <MonthlyStatsCard data={monthlyStats} />
    </div>
  );
};

export default StatisticsSection;
