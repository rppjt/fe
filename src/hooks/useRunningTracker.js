// src/hooks/useRunningTracker.js

import { useRef, useState } from "react";
import { getDistanceFromLatLonInMeters, convertPathToGeoJSON } from "../utils/geoUtils";

export const useRunningTracker = (mapRef, markerRef) => {
  const [isRunning, setIsRunning] = useState(false);
  const [path, setPath] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  const watchIdRef = useRef(null);
  const prevPositionRef = useRef(null);
  const startedTimeRef = useRef(null);
  const timerRef = useRef(null);

  const startRunning = () => {
    setIsRunning(true);
    setPath([]);
    prevPositionRef.current = null;
    startedTimeRef.current = new Date().toISOString();
    setElapsedTime(0);

    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

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

  const stopRunning = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsRunning(false);
    const endedTime = new Date().toISOString();

    if (path.length < 2) {
      alert("기록된 경로가 너무 짧아 저장되지 않았습니다.");
      return null;
    }

    const start = path[0];
    const end = path[path.length - 1];
    const pathGeoJson = JSON.stringify(convertPathToGeoJSON(path));

    setElapsedTime(0); // ⏱️ 경과 시간 초기화

    return {
      start,
      end,
      startedTime: startedTimeRef.current,
      endedTime,
      pathGeoJson,
    };
  };

  return {
    isRunning,
    path,
    elapsedTime,
    startRunning,
    stopRunning,
  };
};
