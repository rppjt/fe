import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKakaoMap } from "../hooks/useKakaoMap";
import { useRunningTracker } from "../hooks/useRunningTracker";
import { formatElapsedTime, formatPace } from "../utils/timeUtils";
import { calculateDistanceFromPath } from "../utils/geoUtils";
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

  const {
    isRunning,
    path,
    startRunning,
    stopRunning,
    elapsedTime,
  } = useRunningTracker(mapRef, markerRef);

  const [showSummary, setShowSummary] = useState(false);
  const [distance, setDistance] = useState(0);
  const [averagePace, setAveragePace] = useState("");
  const [metaData, setMetaData] = useState(null);

  const handleStop = () => {
    const result = stopRunning();
    if (!result) return;

    const dist = calculateDistanceFromPath(path);
    const pace = formatPace(elapsedTime, dist);
    setDistance(dist);
    setAveragePace(pace);
    setMetaData(result);
    setShowSummary(true);
  };

  const handleSave = async () => {
    if (!metaData) return;

    const recordData = {
      distance: distance.toFixed(2),
      time: elapsedTime,
      pace: averagePace,
      pathGeoJson: metaData.pathGeoJson,
      startedTime: metaData.startedTime,
      endedTime: metaData.endedTime,
      startLatitude: metaData.start.lat,
      startLongitude: metaData.start.lng,
      endLatitude: metaData.end.lat,
      endLongitude: metaData.end.lng,
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
