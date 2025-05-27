// src/pages/MyPage.jsx
import { useState } from "react";
import MyRecords from "./MyRecords";
import MyRecommendedCourses from "./MyRecommendedCourses";
import MyFavorites from "./MyFavorites";
import styles from "./myPage.module.css";

const MyPage = () => {
  const [tab, setTab] = useState("records");

  return (
    <div className={styles.container}>
      <h1>📂 마이페이지</h1>

      <div className={styles.tabs}>
        <button
          onClick={() => setTab("records")}
          className={tab === "records" ? styles.active : ""}
        >
          📁 나의 기록
        </button>
        <button
          onClick={() => setTab("recommended")}
          className={tab === "recommended" ? styles.active : ""}
        >
          🏃 내가 만든 추천 코스
        </button>
        <button
          onClick={() => setTab("favorites")}
          className={tab === "favorites" ? styles.active : ""}
        >
          ⭐ 즐겨찾기한 코스
        </button>
      </div>

      <div className={styles.content}>
        {tab === "records" && <MyRecords />}
        {tab === "recommended" && <MyRecommendedCourses />}
        {tab === "favorites" && <MyFavorites />}
      </div>
    </div>
  );
};

export default MyPage;
