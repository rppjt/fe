// src/hooks/useRunningTracker.js
import { useRef, useState } from "react";
import { getDistanceFromLatLonInMeters } from "../utils/geoUtils";

export const useRunningTracker = (mapRef, markerRef) => {
  const [isRunning, setIsRunning] = useState(false);
  const [path, setPath] = useState([]);

  const watchIdRef = useRef(null);
  const prevPositionRef = useRef(null);

  const startRunning = () => {
    setIsRunning(true);
    setPath([]);
    prevPositionRef.current = null;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLatLng = new window.kakao.maps.LatLng(latitude, longitude);

        // 5m 이상 이동 시만 기록
        const prev = prevPositionRef.current;
        if (prev) {
          const distance = getDistanceFromLatLonInMeters(
            prev.lat,
            prev.lng,
            latitude,
            longitude
          );
          if (distance < 5) return;
        }

        // 마커 이동
        markerRef.current?.setPosition(newLatLng);

        // 지도 중심 이동
        mapRef.current?.setCenter(newLatLng);

        // 경로 저장 + 콘솔 출력
        setPath((prev) => {
          const updated = [...prev, { lat: latitude, lng: longitude }];
          console.log("📍 기록된 좌표:", latitude, longitude);
          return updated;
        });

        // 현재 위치 저장
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
    setIsRunning(false);
    console.log("🛑 러닝 종료");
  };

  return {
    isRunning,
    path,
    startRunning,
    stopRunning,
  };
};