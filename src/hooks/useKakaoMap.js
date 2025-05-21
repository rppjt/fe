// src/hooks/useKakaoMap.js
import { useEffect } from "react";

export const useKakaoMap = ({ mapRef, markerRef, containerRef }) => {
  useEffect(() => {
    const loadKakaoMap = () => {
      if (!window.kakao || !window.kakao.maps) return;

      window.kakao.maps.load(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const center = new window.kakao.maps.LatLng(latitude, longitude);

            const map = new window.kakao.maps.Map(containerRef.current, {
              center,
              level: 3,
            });

            const marker = new window.kakao.maps.Marker({
              map,
              position: center,
            });

            mapRef.current = map;
            markerRef.current = marker;
          },
          () => alert("위치 권한을 허용해주세요.")
        );
      });
    };

    const existingScript = document.querySelector("script[src*='dapi.kakao.com']");
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = loadKakaoMap;
      document.head.appendChild(script);
    } else {
      loadKakaoMap();
    }

    return () => {
      // cleanup 위치 추적은 useRunningTracker에서 관리
    };
  }, [containerRef, mapRef, markerRef]);
};