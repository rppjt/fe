// src/components/MapContainer.jsx
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
import { useAuthFetch } from "../utils/useAuthFetch";

const MapContainer = () => {
  const location = useLocation();
  const courseId = new URLSearchParams(location.search).get("courseId");
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const friendMarkersRef = useRef([]);
  const navigate = useNavigate();
  const authFetch = useAuthFetch();

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

  // ✅ 이미지 추가
  formData.append("image", imageBlob, "thumbnail.png");

  // ✅ 기록 정보 묶기
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

  formData.append(
    "data",
    new Blob([JSON.stringify(dataPayload)], { type: "application/json" })
  );

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

  const fetchNearbyFriends = async () => {
    try {
      if (!mapRef.current) return;
      const center = mapRef.current.getCenter();
      const lat = center.getLat();
      const lng = center.getLng();

      const res = await authFetch(`http://localhost:8080/friends/nearby?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error("친구 위치 불러오기 실패");

      const data = await res.json();
      friendMarkersRef.current.forEach(marker => marker.setMap(null));

      const newMarkers = data.map(friend => {
      const position = new window.kakao.maps.LatLng(friend.latitude, friend.longitude);

    // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position,
        map: mapRef.current,
        title: friend.nickname,
        image: new window.kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png",
          new window.kakao.maps.Size(24, 35),
          { offset: new window.kakao.maps.Point(12, 35) }
        ),
      });

    // ✅ InfoWindow 생성
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:6px 12px;font-size:14px;">👟 ${friend.nickname}</div>`,
      });

    // ✅ 마커 클릭 시 InfoWindow 표시
      window.kakao.maps.event.addListener(marker, "click", () => {
        infoWindow.open(mapRef.current, marker);
      });
        return marker;
    });

      friendMarkersRef.current = newMarkers;
    } catch (err) {
      console.error("친구 마커 로딩 실패:", err);
    }
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

    const startMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(metaData.start.lat, metaData.start.lng),
      map: mapRef.current,
      image: new window.kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
        new window.kakao.maps.Size(24, 35)
      ),
    });

    const endMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(metaData.end.lat, metaData.end.lng),
      map: mapRef.current,
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

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNearbyFriends();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  const saved = localStorage.getItem("runningState");
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.isRunning) {
      restoreRunningState(parsed); // useRunningTracker에서 받아온 함수
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
