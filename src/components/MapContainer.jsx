import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useKakaoMap } from "../hooks/useKakaoMap";
import { useRunningTracker } from "../hooks/useRunningTracker";
import { formatElapsedTime, formatPace } from "../utils/timeUtils";
import { calculateDistanceFromPath } from "../utils/geoUtils";
import StartButton from "./buttons/StartButton";
import StopButton from "./buttons/StopButton";
import RunSummary from "./summaries/RunSummary";
import styles from "./MapContainer.module.css";

const MapContainer = () => {
  const location = useLocation();
  const courseId = new URLSearchParams(location.search).get("courseId");
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null); // 실시간 사용자 경로
  const navigate = useNavigate();

  const [coursePath, setCoursePath] = useState(null);

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
      followedCourseId: courseId ? Number(courseId) : null,
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
    alert("❌ 기록이 저장되지 않았습니다. 해당 러닝은 경험치에 반영되지 않습니다.");
    setShowSummary(false);
  };

  // 📍 추천 코스 경로 불러오기
  useEffect(() => {
    const fetchCoursePath = async () => {
      if (!courseId) return;

      try {
        const res = await fetch(`http://localhost:8080/course/${courseId}`);
        const data = await res.json();
        setCoursePath(data.pathGeoJson);
      } catch (err) {
        console.error("코스 경로 불러오기 실패:", err);
      }
    };

    fetchCoursePath();
  }, [courseId]);

  // 📌 추천 코스 Polyline (파란 점선)
  useEffect(() => {
    if (!coursePath || !mapRef.current || !window.kakao?.maps) return;

    const coords = coursePath.coordinates.map(([lng, lat]) =>
      new window.kakao.maps.LatLng(lat, lng)
    );

    const polyline = new window.kakao.maps.Polyline({
      path: coords,
      strokeWeight: 4,
      strokeColor: "#38bdf8",
      strokeOpacity: 0.8,
      strokeStyle: "dash",
    });

    polyline.setMap(mapRef.current);
    mapRef.current.setCenter(coords[0]);
  }, [coursePath]);

  // 📌 실시간 사용자 경로 Polyline (빨간 실선)
  useEffect(() => {
    if (!path || path.length < 2 || !mapRef.current || !window.kakao?.maps) return;

    const coords = path.map(p => new window.kakao.maps.LatLng(p.lat, p.lng));

    if (polylineRef.current) {
      polylineRef.current.setPath(coords);
    } else {
      polylineRef.current = new window.kakao.maps.Polyline({
        path: coords,
        strokeWeight: 5,
        strokeColor: "#f87171",
        strokeOpacity: 0.9,
        strokeStyle: "solid",
      });
      polylineRef.current.setMap(mapRef.current);
    }
  }, [path]);

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
