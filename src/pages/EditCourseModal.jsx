import { useState, useEffect} from "react";
import styles from "./editCourseModal.module.css";
import { useAuthFetch } from "../utils/useAuthFetch"; // 인증된 fetch 훅

const EditCourseModal = ({ course, onClose, onSave }) => {
  const [title, setTitle] = useState(course.title || "");
  const [description, setDescription] = useState(course.description || "");
  const authFetch = useAuthFetch();

  useEffect(() => {
    setTitle(course.title || "");
    setDescription(course.description || "");
  }, [course]);

  const handleSave = async () => {
    if (
      title === course.title &&
      description === course.description
    ) {
      alert("변경된 내용이 없습니다.");
      return;
    }
    try {
      const res = await authFetch(`http://localhost:8080/course/${course.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title, description }),
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

        <div className={styles.actions}>
          <button onClick={(e) => { e.stopPropagation(); handleSave(); }}>저장</button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default EditCourseModal;