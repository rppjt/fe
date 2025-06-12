import { useEffect } from "react";

export const useKakaoMap = ({ mapRef, markerRef, containerRef, onMapReady }) => {
  useEffect(() => {
    const loadKakaoMap = () => {
      console.log("🗺️ loadKakaoMap() 실행됨");
      
      if (!window.kakao || !window.kakao.maps) {
        console.warn("⚠️ kakao maps 객체 없음");
        return;
      }

      window.kakao.maps.load(() => {
        console.log("✅ kakao.maps.load 완료됨");

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("📍 현재 위치 받아옴:", latitude, longitude);

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

            console.log("🟢 지도 및 마커 세팅 완료");

            // ✅ 지도 준비 완료 후 콜백 호출
            if (typeof onMapReady === "function") {
              console.log("🚀 onMapReady() 호출됨");
              onMapReady(); // ← 🔥 핵심 콜백
            }
          },
          (err) => {
            console.error("❌ 위치 권한 요청 실패:", err);
            alert("위치 권한을 허용해주세요.");
          }
        );
      });
    };

    const existingScript = document.querySelector("script[src*='dapi.kakao.com']");
    if (!existingScript) {
      console.log("📦 kakao sdk script 최초 삽입 중");
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = loadKakaoMap;
      document.head.appendChild(script);
    } else {
      console.log("📦 kakao sdk 이미 존재 → loadKakaoMap 바로 실행");
      loadKakaoMap();
    }

    return () => {
      console.log("🧹 useKakaoMap cleanup 실행됨");
    };
  }, [containerRef, mapRef, markerRef, onMapReady]);
};
