import { useEffect, useRef, useState } from "react";

const MapContainer = () => {
  const [path, setPath] = useState([]);
  const mapRef = useRef(null);
  const polylineRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_KAKAO_MAP_API_KEY
    }&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            const container = document.getElementById("map");
            const options = {
              center: new window.kakao.maps.LatLng(latitude, longitude),
              level: 3,
            };

            const map = new window.kakao.maps.Map(container, options);
            mapRef.current = map;

            new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(latitude, longitude),
              map,
            });

            window.kakao.maps.event.addListener(map, "click", function (mouseEvent) {
              const latlng = mouseEvent.latLng;

              setPath((prev) => {
                const newPath = [...prev, latlng];

                if (polylineRef.current) {
                  polylineRef.current.setPath(newPath);
                } else {
                  polylineRef.current = new window.kakao.maps.Polyline({
                    path: newPath,
                    strokeWeight: 4,
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeStyle: "solid",
                  });
                  polylineRef.current.setMap(map);
                }

                return newPath;
              });
            });
          },
          (err) => {
            alert("위치 권한을 허용해주세요.");
          }
        );
      });
    };

    document.head.appendChild(script);
  }, []);

  return (
    <>
      <div id="map" style={{ width: "100%", height: "400px" }}></div>

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
          alert("GeoJSON이 콘솔에 출력되었습니다!");
        }}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
      >
        GeoJSON 확인
      </button>
    </>
  );
};

export default MapContainer;
