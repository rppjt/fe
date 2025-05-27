// src/pages/detailMyRecord.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./myRecords.module.css";

const DetailMyRecord = () => {
  const { id } = useParams();
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await fetch(`http://localhost:8080/running-record
          /${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (!res.ok) throw new Error("기록 불러오기 실패");
        const data = await res.json();
        setRecord(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecord();
  }, [id]);

  useEffect(() => {
    if (!record || !window.kakao || !window.kakao.maps) return;

    const container = document.getElementById("map");
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 5,
    };
    mapRef.current = new window.kakao.maps.Map(container, options);

    const pathData = JSON.parse(record.pathGeoJson);
    const linePath = pathData.coordinates.map(([lng, lat]) =>
      new window.kakao.maps.LatLng(lat, lng)
    );

    polylineRef.current = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 5,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeStyle: "solid",
    });

    polylineRef.current.setMap(mapRef.current);
    mapRef.current.setCenter(linePath[0]);
  }, [record]);

  if (!record) return <div className={styles.container}>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <h2>📍 상세 러닝 기록</h2>
      <div id="map" className={styles.map}></div>
      <div className={styles.recordDetail}>
        <p><strong>시작 시간:</strong> {new Date(record.startedTime).toLocaleString()}</p>
        <p><strong>종료 시간:</strong> {new Date(record.endedTime).toLocaleString()}</p>
        <p><strong>총 거리:</strong> {record.distance} km</p>
        <p><strong>소요 시간:</strong> {Math.floor(record.time / 60)}분 {record.time % 60}초</p>
        <p><strong>평균 페이스:</strong> {record.pace}</p>
      </div>
    </div>
  );
};

export default DetailMyRecord;
