// src/pages/myRecords.jsx
import { useEffect, useRef, useState } from "react";
import styles from "./MyRecords.module.css";

const MyRecords = () => {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const mapRef = useRef(null);
  const polylineRef = useRef(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch("http://localhost:8080/running-records/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error("러닝 기록 불러오기 실패:", err);
      }
    };

    fetchRecords();
  }, []);

  useEffect(() => {
    if (!selectedRecord || !window.kakao || !window.kakao.maps) return;

    const pathData = JSON.parse(selectedRecord.pathGeoJson);

    const linePath = pathData.coordinates.map(([lng, lat]) => 
      new window.kakao.maps.LatLng(lat, lng)
    );

    if (polylineRef.current) {
      polylineRef.current.setMap(null); // 기존 선 제거
    }

    polylineRef.current = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 5,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeStyle: "solid",
    });

    polylineRef.current.setMap(mapRef.current);
    mapRef.current.setCenter(linePath[0]);

  }, [selectedRecord]);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;

    const container = document.getElementById("map");
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 기본 서울 좌표
      level: 5,
    };
    mapRef.current = new window.kakao.maps.Map(container, options);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        <h2>내 러닝 기록</h2>
        {records.map((record) => (
          <div
            key={record.id}
            className={styles.recordItem}
            onClick={() => setSelectedRecord(record)}
          >
            🏃 시작: {new Date(record.startedTime).toLocaleString()}<br />
            ⏱️ 종료: {new Date(record.endedTime).toLocaleString()}
          </div>
        ))}
      </div>

      <div className={styles.mapWrapper}>
        <div id="map" className={styles.map}></div>
      </div>
    </div>
  );
};

export default MyRecords;
