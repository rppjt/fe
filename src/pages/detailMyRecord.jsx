// src/pages/detailMyRecord.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { formatElapsedTime } from "../utils/timeUtils";

const DetailMyRecord = () => {
  const { id } = useParams(); // URL에서 기록 ID 추출
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await fetch(`http://localhost:8080/running-record/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const data = await res.json();
        setRecord(data);
      } catch (err) {
        console.error("기록 상세 조회 실패:", err);
      }
    };

    fetchRecord();
  }, [id]);

  useEffect(() => {
    if (!record || !window.kakao || !window.kakao.maps) return;

    const container = document.getElementById("recordMap");
    const options = {
      center: new window.kakao.maps.LatLng(record.startLatitude, record.startLongitude),
      level: 5,
    };

    mapRef.current = new window.kakao.maps.Map(container, options);

    // 경로 선
    const pathData = JSON.parse(record.pathGeoJson);
    const linePath = pathData.coordinates.map(([lng, lat]) =>
      new window.kakao.maps.LatLng(lat, lng)
    );

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    polylineRef.current = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 5,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeStyle: "solid",
    });
    polylineRef.current.setMap(mapRef.current);

    // 시작 마커
    new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(record.startLatitude, record.startLongitude),
      map: mapRef.current,
    });

    // 종료 마커
    new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(record.endLatitude, record.endLongitude),
      map: mapRef.current,
    });

  }, [record]);

  if (!record) return <div>기록을 불러오는 중...</div>;

  return (
    <div className={styles.container}>
      <h2>🏃 러닝 기록 상세</h2>
      <div className={styles.stats}>
        <p><strong>총 시간:</strong> {formatElapsedTime(record.totalTime)}</p>
        <p><strong>총 거리:</strong> {record.totalDistance.toFixed(2)} km</p>
        <p><strong>평균 페이스:</strong> {Math.floor(record.pace / 60)}' {String(Math.floor(record.pace % 60)).padStart(2, "0")}"</p>
      </div>
      <div id="recordMap" className={styles.map}></div>
    </div>
  );
};

export default DetailMyRecord;
