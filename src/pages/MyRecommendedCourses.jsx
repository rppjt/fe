// src/pages/MyRecommendedCourses.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/authFetch";
import styles from "./MyPage.module.css";

const MyRecommendedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [editId, setEditId] = useState(null); // 수정 중인 코스 ID
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const res = await authFetch("http://localhost:8080/course/my");
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("❌ 내가 만든 추천 코스 불러오기 실패:", err);
      }
    };

    fetchMyCourses();
  }, []);

  const handleClick = (id) => {
    navigate(`/course/${id}`);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("accessToken");
    const confirm = window.confirm("정말 이 추천 코스를 삭제하시겠습니까?");
    if (!confirm) return;

    try {
      await fetch(`http://localhost:8080/course/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setCourses((prev) => prev.filter((c) => c.id !== id));
      alert("✅ 추천 코스가 삭제되었습니다");
    } catch (err) {
      console.error("❌ 추천 코스 삭제 실패:", err);
    }
  };

  const handleEditStart = (course) => {
    setEditId(course.id);
    setEditTitle(course.title);
    setEditDescription(course.description || "");
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const handleEditSubmit = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(`http://localhost:8080/course/${editId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      if (!res.ok) throw new Error("수정 실패");

      const updated = await res.json();
      setCourses((prev) =>
        prev.map((c) => (c.id === editId ? updated : c))
      );
      handleEditCancel();
      alert("✏️ 추천 코스가 수정되었습니다");
    } catch (err) {
      console.error("❌ 수정 요청 실패:", err);
    }
  };

  return (
    <div>
      <h2>🏃 내가 만든 추천 코스</h2>
      {courses.length === 0 ? (
        <p>아직 등록한 추천 코스가 없습니다.</p>
      ) : (
        <ul className={styles.favoriteList}>
          {courses.map((course) => (
            <li
              key={course.id}
              className={styles.favoriteItem}
              onClick={() => handleClick(course.id)}
            >
              {editId === course.id ? (
                <div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="코스 제목"
                  />
                  <br />
                  <textarea
                    rows="2"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="코스 설명"
                  />
                  <br />
                  <button onClick={handleEditSubmit}>💾 저장</button>
                  <button onClick={handleEditCancel}>❌ 취소</button>
                </div>
              ) : (
                <>
                  <p className={styles.courseTitle}>{course.title}</p>
                  <p>{course.distance} km | ❤️ {course.likes}</p>
                  <p>{course.description || "설명이 없습니다."}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStart(course);
                    }}
                  >
                    ✏️ 수정
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(course.id);
                    }}
                    className={styles.deleteButton}
                  >
                    🗑️ 삭제
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyRecommendedCourses;
