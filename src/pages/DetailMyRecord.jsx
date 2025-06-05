// src/pages/detailMyRecord.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import styles from "./myRecords.module.css";
import { useAuthFetch } from "../utils/useAuthFetch"; // 인증된 fetch 훅

const DetailMyRecord = () => {
  const { id } = useParams();
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const [record, setRecord] = useState(null);
  const authFetch = useAuthFetch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await authFetch(`http://localhost:8080/running-record/${id}`);
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
    console.log("🔥 record.pathGeoJson:", record?.pathGeoJson);
    const pathData = record.pathGeoJson;
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

  const handleDelete = async () => {

  if (!window.confirm("삭제 후 복구 페이지로 이동합니다. 계속할까요?")) return; 
    
  try {
    // 복구용 데이터를 로컬스토리지에 저장
    localStorage.setItem("unsavedRun", JSON.stringify({
      distance: record.totalDistance,
      time: record.totalTime,
      pace: record.pace
    }));

    // 실제 서버에서 기록 삭제 (소프트 삭제로 PATCH 사용 중)
    await authFetch(`http://localhost:8080/running-record/${record.id}/delete`, {
      method: "PATCH",
    });

    // 복구 페이지로 이동
    navigate("/recover");
  } catch (err) {
    console.error("❌ 삭제 실패:", err);
  }
};

  return (
    <div className={styles.container}>
      <h2>📍 상세 러닝 기록</h2>
      {record.thumbnailUrl && (
        <img
          src={record.thumbnailUrl}
          alt="러닝 썸네일"
          className={styles.thumbnail}
          style={{
          width: "100%",
          maxHeight: "300px",
          objectFit: "cover",
          borderRadius: "10px",
          marginBottom: "1rem"
          }}
        />
      )}
      <div id="map" className={styles.map}></div>
      <div className={styles.recordDetail}>
        <p><strong>시작 시간:</strong> {new Date(record.startedTime).toLocaleString()}</p>
        <p><strong>종료 시간:</strong> {new Date(record.endedTime).toLocaleString()}</p>
        <p><strong>총 거리:</strong> {record.totalDistance} km</p>
        <p><strong>소요 시간:</strong> {Math.floor(record.totalTime / 60)}분 {record.totalTime % 60}초</p>
        <p><strong>페이스:</strong> {record.pace} 분/km</p>
      </div>
      {/* ✅ 삭제 버튼 */}
    <button onClick={handleDelete} className={styles.deleteButton}>
      🗑️ 기록 삭제
    </button>
    </div>
  );
};

export default DetailMyRecord;
