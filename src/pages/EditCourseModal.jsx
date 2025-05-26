import { useState, useEffect } from "react";
import styles from "./editCourseModal.module.css";

const EditCourseModal = ({ course, onClose, onSave }) => {
  const [title, setTitle] = useState(course.title || "");
  const [description, setDescription] = useState(course.description || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnailUrl || "");

  useEffect(() => {
    setTitle(course.title || "");
    setDescription(course.description || "");
    setThumbnailUrl(course.thumbnailUrl || "");
  }, [course]);

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:8080/course/${course.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, thumbnailUrl }),
      });

      if (!res.ok) throw new Error("수정 실패");

      const updatedCourse = await res.json();
      onSave(updatedCourse); // 부모에게 전달
      onClose(); // 모달 닫기
    } catch (err) {
      alert("수정 중 오류 발생: " + err.message);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>추천 코스 수정</h2>

        <label>제목</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>설명</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>썸네일 URL</label>
        <input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />

        <div className={styles.actions}>
          <button onClick={onClose}>취소</button>
          <button onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default EditCourseModal;
