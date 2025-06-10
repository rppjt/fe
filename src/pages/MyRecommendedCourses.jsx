import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthFetch } from "../utils/useAuthFetch";
import EditCourseModal from "../components/EditCourseModal"; // ✅ 추가
import styles from "./myPage.module.css";

const MyRecommendedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [editId, setEditId] = useState(null); // ✅ 단일 ID로 관리
  const navigate = useNavigate();
  const authFetch = useAuthFetch();

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
      await authFetch(`http://localhost:8080/course/${id}`, {
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
  };

  return (
    <div>
      <h2>🏃 내가 만든 추천 코스</h2>

      {editId && (
        <EditCourseModal
          course={courses.find((c) => c.id === editId)}
          onClose={() => setEditId(null)}
          onSave={(updated) => {
            setCourses((prev) =>
              prev.map((c) => (c.id === updated.id ? updated : c))
            );
            setEditId(null);
          }}
        />
      )}

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
              <p className={styles.courseTitle}>{course.title}</p>
              <p>{course.totalDistance} km | ❤️ {course.likes}</p>
              <p>{course.description || "설명이 없습니다."}</p>
              <img
                src={course.imageUrl || "/course-default-thumbnail.jpg"}
                alt={course.title}
                className={styles.thumbnail}
              />
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyRecommendedCourses;
