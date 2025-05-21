// src/hooks/useRunningTracker.js
import { useRef, useState } from "react";
import { getDistanceFromLatLonInMeters, convertPathToGeoJSON } from "../utils/geoUtils";

export const useRunningTracker = (mapRef, markerRef) => {
  const [isRunning, setIsRunning] = useState(false);
  const [path, setPath] = useState([]);

  const watchIdRef = useRef(null);
  const prevPositionRef = useRef(null);
  const startedTimeRef = useRef(null);

  const startRunning = () => {
    setIsRunning(true);
    setPath([]);
    prevPositionRef.current = null;
    startedTimeRef.current = new Date().toISOString(); // 시작 시간 기록

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLatLng = new window.kakao.maps.LatLng(latitude, longitude);

        const prev = prevPositionRef.current;
        if (prev) {
          const distance = getDistanceFromLatLonInMeters(prev.lat, prev.lng, latitude, longitude);
          if (distance < 5) return;
        }

        markerRef.current?.setPosition(newLatLng);
        mapRef.current?.setCenter(newLatLng);

        setPath((prev) => {
          const updated = [...prev, { lat: latitude, lng: longitude }];
          console.log("📍 기록된 좌표:", latitude, longitude);
          return updated;
        });

        prevPositionRef.current = { lat: latitude, lng: longitude };
      },
      (error) => {
        console.error("위치 추적 오류:", error);
        alert("위치 추적에 실패했습니다.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  };

  const stopRunning = async () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    setIsRunning(false);
    console.log("🛑 러닝 종료");

    const endedTime = new Date().toISOString();

    if (path.length < 2) {
      alert("기록된 경로가 너무 짧아 저장되지 않았습니다.");
      return;
    }

    const start = path[0];
    const end = path[path.length - 1];
    const pathGeoJson = JSON.stringify(convertPathToGeoJSON(path));

    const requestBody = {
      pathGeoJson,
      startLatitude: start.lat,
      startLongitude: start.lng,
      endLatitude: end.lat,
      endLongitude: end.lng,
      startedTime: startedTimeRef.current,
      endedTime,
    };

    try {
      const response = await fetch("http://localhost:8080/running-record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("서버 응답 오류");
      }

      alert("✅ 러닝 기록이 성공적으로 저장되었습니다.");
    } catch (err) {
      console.error("❌ 러닝 기록 저장 실패:", err);
      alert("기록 저장에 실패했습니다.");
    }
  };

  return {
    isRunning,
    path,
    startRunning,
    stopRunning,
  };
};
