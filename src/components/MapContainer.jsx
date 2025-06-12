// src/components/MapContainer.jsx
import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useKakaoMap } from "../hooks/useKakaoMap";
import { useRunningTracker } from "../hooks/useRunningTracker";
import { formatElapsedTime, formatPace } from "../utils/timeUtils";
import { calculateDistanceFromPath, getDistanceFromLatLonInMeters } from "../utils/geoUtils";
import StartButton from "./buttons/StartButton";
import StopButton from "./buttons/StopButton";
import RunSummary from "./summaries/RunSummary";
import styles from "./MapContainer.module.css";
import html2canvas from "html2canvas";
import { useAuthFetch } from "../utils/useAuthFetch";
import { useUploadFetch } from "../utils/useUploadFetch";
import { useLocationContext } from "../contexts/LocationContext";

const MapContainer = () => {
  const location = useLocation();
  const courseId = new URLSearchParams(location.search).get("courseId");
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const friendMarkersRef = useRef([]);
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const uploadFetch = useUploadFetch();
  const { showFriendsOnMap } = useLocationContext();

  const [showSummary, setShowSummary] = useState(false);
  const [distance, setDistance] = useState(0);
  const [averagePace, setAveragePace] = useState("");
  const [metaData, setMetaData] = useState(null);

  useKakaoMap({ mapRef, markerRef, containerRef });

  const {
    isRunning,
    path,
    startRunning,
    stopRunning,
    elapsedTime,
    restoreRunningState,
  } = useRunningTracker(mapRef, markerRef);

  const handleStop = () => {
    const result = stopRunning();
    if (!result || !path || path.length === 0) {
      alert("❌ 위치 데이터가 충분하지 않아 러닝을 저장할 수 없습니다.");
      return;
    }

    const dist = calculateDistanceFromPath(path);
    const pace = formatPace(elapsedTime, dist);
    setDistance(dist);
    setAveragePace(pace);
    setMetaData(result);
    setShowSummary(true);
  };

  const fitMapToPath = () => {
    if (!mapRef.current || path.length < 2) return;
    const bounds = new window.kakao.maps.LatLngBounds();
    path.forEach((point) => {
      bounds.extend(new window.kakao.maps.LatLng(point.lat, point.lng));
    });
    mapRef.current.setBounds(bounds);
  };

  const captureMapAsImage = async () => {
    const mapElement = document.getElementById("map");
    if (!mapElement) return null;

    const canvas = await html2canvas(mapElement);
    const resizedCanvas = document.createElement("canvas");
    const ctx = resizedCanvas.getContext("2d");
    resizedCanvas.width = 400;
    resizedCanvas.height = 300;
    ctx.drawImage(canvas, 0, 0, 400, 300);

    return canvas.toDataURL("image/png", 0.8);
  };

  const handleSave = async () => {
    if (!metaData) return;

    fitMapToPath();
    await new Promise((r) => setTimeout(r, 1000));
    const imageDataUrl = await captureMapAsImage();
    const imageBlob = await (await fetch(imageDataUrl)).blob();

    const formData = new FormData();
    formData.append("image", imageBlob, "thumbnail.png");

    const dataPayload = {
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

    if (courseId) {
      dataPayload.followedCourseId = courseId;
    }

    formData.append("data", new Blob([JSON.stringify(dataPayload)], { type: "application/json" }));

    try {
      const response = await uploadFetch("http://localhost:8080/running-record", formData);
      if (!response.ok) throw new Error("서버 응답 실패");
      alert("✅ 러닝 기록이 저장되었습니다!");
      setShowSummary(false);
      navigate("/myrecords");
    } catch (error) {
      console.error("❌ 저장 실패:", error.message);
      alert("⚠️ 저장 실패! 복구 기능이 활성화됩니다.");
      localStorage.setItem("unsavedRun", JSON.stringify({
        ...metaData,
        distance: distance.toFixed(2),
        time: elapsedTime,
        pace: averagePace,
        imageDataUrl,
      }));
    }
  };

  const handleCancel = () => {
    alert("❌ 기록이 저장되지 않았습니다. 해당 러닝은 경험치에 반영되지 않습니다.");
    setShowSummary(false);
  };

  useEffect(() => {
    const fetchNearbyFriends = async () => {
      if (!showFriendsOnMap || !mapRef.current) return;

      try {
        const res = await authFetch("http://localhost:8080/friends/nearby?radius=0.5");
        if (!res.ok) throw new Error("친구 목록 가져오기 실패");
        const data = await res.json();

        friendMarkersRef.current.forEach((marker) => marker.setMap(null));
        friendMarkersRef.current = [];

        if (!Array.isArray(data) || data.length === 0) return;

        const center = mapRef.current.getCenter();
        const centerLat = center.getLat();
        const centerLng = center.getLng();

        data.forEach(({ latitude, longitude, nickname, profileImage }) => {
          const distance = getDistanceFromLatLonInMeters(centerLat, centerLng, latitude, longitude);

          if (distance <= 500) {
            const markerImage = new window.kakao.maps.MarkerImage(
              profileImage || "/default-profile.png",
              new window.kakao.maps.Size(40, 40),
              { offset: new window.kakao.maps.Point(20, 20) }
            );

            const marker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(latitude, longitude),
              map: mapRef.current,
              title: nickname,
              image: markerImage,
            });

            friendMarkersRef.current.push(marker);
          }
        });
      } catch (err) {
        console.error("📛 친구 마커 로딩 실패:", err);
      }
    };

    const interval = setInterval(fetchNearbyFriends, 10000);
    fetchNearbyFriends();
    return () => clearInterval(interval);
  }, [showFriendsOnMap]);

  useEffect(() => {
    const saved = localStorage.getItem("runningState");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.isRunning === true && !parsed?.endedTime) {
        restoreRunningState(parsed);
      }
    }
  }, []);

  return (
    <>
      <div className={styles.mapWrapper}>
        <div ref={containerRef} id="map" className={styles.map}></div>
        {isRunning && (
          <div className={styles.timer}>⏱️ {formatElapsedTime(elapsedTime)}</div>
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