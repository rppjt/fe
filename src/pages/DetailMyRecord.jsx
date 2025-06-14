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
  const [isRecommended, setIsRecommended] = useState(false);
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

   // 추천 여부 확인
  useEffect(() => {
    const checkRecommendation = async () => {
      try {
        const res = await authFetch(`http://localhost:8080/course/check/${id}`);
        console.log("🔎 진입한 기록 ID:", id);
        const data = await res.json();
        setIsRecommended(data.isRecommended);
      } catch (err) {
        console.error("❌ 추천 여부 확인 실패:", err);
        setIsRecommended(false);
      }
    };
    checkRecommendation();
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

  // 추천 등록 처리
  const handleRecommend = async () => {
    if (!window.confirm("이 기록을 추천코스로 등록하시겠습니까?")) return;

    try {
      const res = await authFetch(`http://localhost:8080/course`, {
        method: "POST",
        body: JSON.stringify({ recordId: parseInt(id) }),
      });

      if (!res.ok) throw new Error("추천 등록 실패");
      alert("🚀 추천코스로 등록되었습니다!");
      navigate("/courses");
      setIsRecommended(true);
    } catch (err) {
      console.error("❌ 추천 등록 실패:", err);
      alert("⚠️ 등록 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("삭제 후 복구 페이지로 이동합니다. 계속할까요?")) return;

    try {
      // 1. 로컬스토리지에 복구용 데이터 저장
      const recoveryData = {
        distance: record.totalDistance,
        time: record.totalTime,
        pace: record.pace,
      };
      localStorage.setItem("unsavedRun", JSON.stringify(recoveryData));

      // 2. API 요청 (DELETE)
      const response = await authFetch(`http://localhost:8080/running-record/${record.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 응답 오류: ${response.status} - ${errorText}`);
      }

      // 3. 성공 시 복구 페이지로 이동
      alert("✅ 삭제 완료! 복구 페이지로 이동합니다.");
      navigate("/recover");
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
      alert("⚠️ 삭제 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
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

      {/* ✅ 추천 등록 버튼 */}
      {!isRecommended && (
        <button onClick={handleRecommend} className={styles.recommendButton}>
          🚀 추천코스 등록
        </button>
      )}

      {/* ✅ 삭제 버튼 */}
    <button onClick={handleDelete} className={styles.deleteButton}>
      🗑️ 기록 삭제
    </button>
    </div>
  );
};

export default DetailMyRecord;
