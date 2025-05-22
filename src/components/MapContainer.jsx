import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKakaoMap } from "../hooks/useKakaoMap";
import { useRunningTracker } from "../hooks/useRunningTracker";
import { formatElapsedTime } from "../utils/timeUtils";
import StartButton from "./buttons/StartButton";
import StopButton from "./buttons/StopButton";
import RunSummary from "./summaries/RunSummaries";
import styles from "./MapContainer.module.css";

const MapContainer = () => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const navigate = useNavigate();

  useKakaoMap({ mapRef, markerRef, containerRef });
  const { isRunning, path, startRunning, stopRunning, elapsedTime } =
    useRunningTracker(mapRef, markerRef);

  const [showSummary, setShowSummary] = useState(false);
  const [distance, setDistance] = useState(0);
  const [averagePace, setAveragePace] = useState("");

  const calculateDistance = (path) => {
    if (path.length < 2) return 0;
    const toRad = (value) => (value * Math.PI) / 180;
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      const [lat1, lng1] = path[i - 1];
      const [lat2, lng2] = path[i];
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += R * c;
    }
    return total;
  };

  const calculateAveragePace = (timeSec, distanceKm) => {
    if (distanceKm === 0) return "0'00\"";
    const paceSec = timeSec / distanceKm;
    const min = Math.floor(paceSec / 60);
    const sec = Math.floor(paceSec % 60);
    return `${min}'${sec.toString().padStart(2, "0")}"`;
  };

  const handleStop = () => {
    stopRunning();
    const dist = calculateDistance(path);
    const pace = calculateAveragePace(elapsedTime, dist);
    setDistance(dist);
    setAveragePace(pace);
    setShowSummary(true);
  };

  const handleSave = async () => {
    const recordData = {
      distance: distance.toFixed(2),
      time: elapsedTime,
      pace: averagePace,
      path: path,
    };

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:8080/running-record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recordData),
      });

      if (!response.ok) throw new Error("서버 응답 실패");

      alert("✅ 러닝 기록이 저장되었습니다!");
      setShowSummary(false);
      navigate("/myrecords");
    } catch (error) {
      console.error("❌ 저장 실패:", error.message);
      localStorage.setItem("unsavedRun", JSON.stringify(recordData));
      alert("⚠️ 저장 실패! 다음 접속 시 복구 안내를 제공합니다.");
    }
  };

  const handleCancel = () => {
    setShowSummary(false);
  };

  return (
    <>
      <div className={styles.mapWrapper}>
        <div ref={containerRef} className={styles.map}></div>

        {isRunning && (
          <div className={styles.timer}>
            ⏱️ {formatElapsedTime(elapsedTime)}
          </div>
        )}
      </div>

      {!isRunning && !showSummary && <StartButton onClick={startRunning} />}
      {isRunning && <StopButton onClick={handleStop} />}
      {showSummary && (
        <RunSummary
          elapsedTime={elapsedTime}
          distance={distance}
          pace={averagePace}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default MapContainer;
