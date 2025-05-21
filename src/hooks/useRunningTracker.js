// src/hooks/useRunningTracker.js
import { useRef, useState, useEffect } from "react";
import { getDistanceFromLatLonInMeters, convertPathToGeoJSON } from "../utils/geoUtils";

export const useRunningTracker = (mapRef, markerRef) => {
  const [isRunning, setIsRunning] = useState(false);
  const [path, setPath] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0); // ⏱️ 경과 시간 상태 추가

  const watchIdRef = useRef(null);
  const prevPositionRef = useRef(null);
  const startedTimeRef = useRef(null);
  const timerRef = useRef(null); // ⏱️ 타이머 참조 저장용

  const startRunning = () => {
    setIsRunning(true);
    setPath([]);
    prevPositionRef.current = null;
    startedTimeRef.current = new Date().toISOString();
    setElapsedTime(0); // 시작 시 초기화

    // ⏱️ 1초마다 경과 시간 증가
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // 위치 추적 시작
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

        setPath((prev) => [...prev, { lat: latitude, lng: longitude }]);
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

    if (timerRef.current) {
      clearInterval(timerRef.current); // ⏱️ 타이머 종료
    }

    setIsRunning(false);
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

      if (!response.ok) throw new Error("서버 응답 오류");
      alert("✅ 러닝 기록이 저장되었습니다!");
    } catch (err) {
      console.error("러닝 기록 저장 실패:", err);
      alert("기록 저장 중 오류 발생");
    }

    setElapsedTime(0); // ⏱️ 타이머 초기화
  };

  return {
    isRunning,
    path,
    elapsedTime, // ⏱️ 외부에서 경과 시간 표시 가능하게 반환
    startRunning,
    stopRunning,
  };
};
