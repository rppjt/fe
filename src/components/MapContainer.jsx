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
import html2canvas from "html2canvas";

const MapContainer = () => {
  const location = useLocation();
  const courseId = new URLSearchParams(location.search).get("courseId");
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const navigate = useNavigate();

  const [coursePath, setCoursePath] = useState(null);
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
  } = useRunningTracker(mapRef, markerRef);

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
    if (!mapElement) {
      console.error("❌ 지도 DOM을 찾을 수 없습니다.");
      return null;
    }
    const canvas = await html2canvas(mapElement);

    const resizedCanvas = document.createElement("canvas");
    const ctx = resizedCanvas.getContext("2d");
    resizedCanvas.width = 400;
    resizedCanvas.height = 300;
    ctx.drawImage(canvas, 0, 0, 400, 300);

    return canvas.toDataURL("image/png",0.8);
  };

  const handleSave = async () => {
    if (!metaData) return;

    fitMapToPath();
    await new Promise((r) => setTimeout(r, 1000));

    const imageDataUrl = await captureMapAsImage();
    if (!imageBlob) return;

    const imageBlob = await (await fetch(imageDataUrl)).blob();
    const formData = new FormData();
    formData.append("thumbnail", imageBlob, "thumbnail.png");
    formData.append("distance", distance.toFixed(2));
    formData.append("time", elapsedTime);
    formData.append("pace", averagePace);
    formData.append("pathGeoJson", JSON.stringify(metaData.pathGeoJson));
    formData.append("startedTime", metaData.startedTime);
    formData.append("endedTime", metaData.endedTime);
    formData.append("startLatitude", metaData.start.lat);
    formData.append("startLongitude", metaData.start.lng);
    formData.append("endLatitude", metaData.end.lat);
    formData.append("endLongitude", metaData.end.lng);
    if (courseId) formData.append("followedCourseId", courseId);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:8080/running-record", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("서버 응답 실패");

      alert("✅ 러닝 기록이 저장되었습니다!");
      setShowSummary(false);
      navigate("/myrecords");
    } catch (error) {
      console.error("❌ 저장 실패:", error.message);
      alert("⚠️ 저장 실패! 복구 기능이 활성화됩니다.");
      localStorage.setItem("unsavedRun", JSON.stringify(metaData));
    }
  };

  const handleCancel = () => {
    alert("❌ 기록이 저장되지 않았습니다. 해당 러닝은 경험치에 반영되지 않습니다.");
    setShowSummary(false);
  };

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

  useEffect(() => {
    if (!path || path.length < 2 || !mapRef.current || !window.kakao?.maps) return;

    const coords = path.map((p) => new window.kakao.maps.LatLng(p.lat, p.lng));

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

  useEffect(() => {
    if (!showSummary || !mapRef.current || !metaData) return;

    const map = mapRef.current;

    const startMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(metaData.start.lat, metaData.start.lng),
      map,
      image: new window.kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
        new window.kakao.maps.Size(24, 35)
      ),
    });

    const endMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(metaData.end.lat, metaData.end.lng),
      map,
      image: new window.kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/red_b.png",
        new window.kakao.maps.Size(24, 35)
      ),
    });

    return () => {
      startMarker.setMap(null);
      endMarker.setMap(null);
    };
  }, [showSummary, metaData]);

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
