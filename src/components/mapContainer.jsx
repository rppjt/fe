// src/components/MapContainer.jsx
import { useRef } from "react";
import { useKakaoMap } from "../hooks/useKakaoMap";
import { useRunningTracker } from "../hooks/useRunningTracker";
import { formatElapsedTime } from "../utils/timeUtils"; // ⏱️ 시간 포맷 함수 import
import styles from "./MapContainer.module.css";

const MapContainer = () => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // 지도 초기화 훅
  useKakaoMap({ mapRef, markerRef, containerRef });

  // 러닝 추적 훅 (⏱️ elapsedTime 추가)
  const { isRunning, path, startRunning, stopRunning, elapsedTime } = useRunningTracker(mapRef, markerRef);

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

      {!isRunning && (
        <button onClick={startRunning} className={styles.runButton}>
          🏃 러닝 시작
        </button>
      )}

      {isRunning && (
        <button onClick={stopRunning} className={styles.stopButton}>
          🛑 러닝 종료
        </button>
      )}
    </>
  );
};

export default MapContainer;
