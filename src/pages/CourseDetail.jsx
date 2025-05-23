// src/pages/CourseDetail.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./CourseDetail.module.css";

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [likes, setLikes] = useState(0);
  const mapRef = useRef(null);
  const polylineRef = useRef(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:8080/course/${id}`);
        const data = await res.json();
        setCourse(data);
        setLikes(data.likes);

        // 지도 표시
        if (!window.kakao || !window.kakao.maps) return;
        const pathCoords = data.pathGeoJson.coordinates.map(([lng, lat]) =>
          new window.kakao.maps.LatLng(lat, lng)
        );

        const map = new window.kakao.maps.Map(mapRef.current, {
          center: pathCoords[0],
          level: 4,
        });

        const polyline = new window.kakao.maps.Polyline({
          path: pathCoords,
          strokeWeight: 4,
          strokeColor: "#007bff",
          strokeOpacity: 0.9,
          strokeStyle: "solid",
        });

        polyline.setMap(map);
        polylineRef.current = polyline;
      } catch (err) {
        console.error("코스 정보 로딩 실패:", err);
      }
    };

    fetchCourse();
  }, [id]);

  const handleLikeToggle = async () => {
    try {
      const res = await fetch(`http://localhost:8080/course/like/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      setLikes(data.likes);
    } catch (err) {
      console.error("좋아요 토글 실패:", err);
    }
  };

  if (!course) return <div>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <h2>{course.title}</h2>
      <p>📏 거리: {course.distance} km</p>
      <p>❤️ 좋아요: {likes}</p>
      <button onClick={handleLikeToggle} className={styles.likeButton}>
        좋아요 토글
      </button>
      <div ref={mapRef} className={styles.map}></div>
    </div>
  );
};

export default CourseDetail;
