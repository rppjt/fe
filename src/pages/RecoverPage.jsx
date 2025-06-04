// src/pages/RecoverPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RecoverPage.module.css";
import { useAuthFetch } from "../utils/useAuthFetch"; // 인증된 fetch 훅

const RecoverPage = () => {
  const navigate = useNavigate();
  const [recoveryData, setRecoveryData] = useState(null);
  const authFetch = useAuthFetch();

  useEffect(() => {
    const data = localStorage.getItem("unsavedRun");
    if (data) {
      setRecoveryData(JSON.parse(data));
    } else {
      alert("복구할 기록이 없습니다.");
      navigate("/home");
    }
  }, [navigate]);

  const handleRestore = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await authFetch("http://localhost:8080/running-record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recoveryData),
      });

      if (!res.ok) throw new Error("복구 요청 실패");

      alert("✅ 복구 완료!");
      localStorage.removeItem("unsavedRun");
      navigate("/my-records");
    } catch (err) {
      console.error("❌ 복구 실패:", err);
      alert("복구 중 오류 발생");
    }
  };

  const handleCancel = () => {
    localStorage.removeItem("unsavedRun");
    navigate("/recover");
  };

  const handlePermanentDelete = async (recordId) => {
  if (window.confirm("영구적으로 삭제됩니다. 계속하시겠습니까?")) {
    try {
      await authFetch(`http://localhost:8080/running-record/${recordId}/delete-permanent`, {
        method: "DELETE",
      });
      alert("✅ 기록이 영구 삭제되었습니다.");

      // 영구 삭제 후 my-records로 이동
      navigate("/my-records");
    } catch (err) {
      console.error("❌ 영구 삭제 실패:", err);
      alert("영구 삭제 실패");
    }
  } else {
    // 취소 시 아무 작업 없이 팝업창을 닫고 그대로 `RecoverPage`에 남게 됩니다.
    console.log("삭제가 취소되었습니다.");
  }
};

  if (!recoveryData) return <div>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <h2>📦 복구할 기록</h2>
      <p><strong>거리:</strong> {recoveryData.distance} km</p>
      <p><strong>시간:</strong> {recoveryData.time}초</p>
      <p><strong>평균 페이스:</strong> {recoveryData.pace}</p>
      <div className={styles.buttons}>
        <button onClick={handleRestore}>✅ 복구하기</button>
        <button onClick={() => handlePermanentDelete(recoveryData.id)}>🗑️ 삭제</button>
        <button onClick={handleCancel}>취소</button>
      </div>
    </div>
  );
};

export default RecoverPage;
