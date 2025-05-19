import { useEffect, useRef, useState } from "react";

const MapContainer = () => {
  const [path, setPath] = useState([]);
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const overlaysRef = useRef([]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_KAKAO_MAP_API_KEY
    }&autoload=false&libraries=services`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const center = new window.kakao.maps.LatLng(latitude, longitude);

            const container = document.getElementById("map");
            const options = { center, level: 3 };
            const map = new window.kakao.maps.Map(container, options);
            mapRef.current = map;

            // ✅ 현재 위치 마커 (파란색 이미지)
            const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
            const markerImage = new window.kakao.maps.MarkerImage(imageSrc, new window.kakao.maps.Size(24, 35));
            new window.kakao.maps.Marker({
              map,
              position: center,
              image: markerImage,
            });

            // ✅ 클릭 시 선 + 거리 표시
            window.kakao.maps.event.addListener(map, "click", function (mouseEvent) {
              const latlng = mouseEvent.latLng;

              setPath((prev) => {
                const newPath = [...prev, latlng];

                // 선
                if (polylineRef.current) {
                  polylineRef.current.setPath(newPath);
                } else {
                  polylineRef.current = new window.kakao.maps.Polyline({
                    path: newPath,
                    strokeWeight: 4,
                    strokeColor: "#3478f6", // 카카오맵 파랑 느낌
                    strokeOpacity: 0.9,
                    strokeStyle: "solid",
                  });
                  polylineRef.current.setMap(map);
                }

                // 거리 표시 (전 지점이 있어야 함)
                if (newPath.length >= 2) {
                  const prev = newPath[newPath.length - 2];
                  const distance = window.kakao.maps.geometry.spherical.computeDistanceBetween(prev, latlng);

                  const midLat = (prev.getLat() + latlng.getLat()) / 2;
                  const midLng = (prev.getLng() + latlng.getLng()) / 2;
                  const midPoint = new window.kakao.maps.LatLng(midLat, midLng);

                  const overlay = new window.kakao.maps.CustomOverlay({
                    map,
                    position: midPoint,
                    content: `<div style="padding:4px 6px;background:white;border:1px solid #ccc;border-radius:4px;font-size:12px;">
                      ${distance.toFixed(0)}m
                    </div>`,
                  });

                  overlaysRef.current.push(overlay);
                }

                return newPath;
              });
            });
          },
          () => {
            alert("위치 권한을 허용해주세요.");
          }
        );
      });
    };

    document.head.appendChild(script);
  }, []);

  return (
    <>
      <div
        id="map"
        style={{
          width: "100%",
          height: "500px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      ></div>

      <button
        onClick={() => {
          const geoJson = {
            type: "LineString",
            coordinates: path.map((latlng) => [
              latlng.getLng(),
              latlng.getLat(),
            ]),
          };
          console.log("GeoJSON 결과", JSON.stringify(geoJson, null, 2));
        }}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#3478f6",
          color: "white",
          border: "none",
          borderRadius: "6px",
        }}
      >
        GeoJSON 확인
      </button>
    </>
  );
};

export default MapContainer;
