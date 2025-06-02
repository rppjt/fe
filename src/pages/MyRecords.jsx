import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./myRecords.module.css";
import { useAuthFetch } from "../utils/useAuthFetch";
import { useAuth } from "../contexts/AuthContext.jsx";


const MyRecords = () => {
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const { isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;

    const fetchRecords = async () => {
      try {
        const res = await authFetch("http://localhost:8080/running-record");

        if (!res.ok) throw new Error("데이터 로딩 실패");

        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error("❌ 기록 불러오기 오류:", err);
      }
    };

    fetchRecords();
  }, [isAuthReady]);

  const handleClick = (id) => {
    navigate(`/my-records/${id}`);
  };

  const toggleFavorite = async (record) => {
    const isFavorite = record.favorite === true;

    try {
      if (isFavorite) {
        await authFetch(`http://localhost:8080/favorite/${record.id}`, {
          method: "DELETE",
        });
        alert("⭐ 즐겨찾기에서 삭제됨");
        setRecords((prev) =>
          prev.map((r) => (r.id === record.id ? { ...r, favorite: false } : r))
        );
      } else {
        await authFetch(`http://localhost:8080/favorite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordId: record.id }),
        });
        alert("⭐ 즐겨찾기에 추가됨");
        setRecords((prev) =>
          prev.map((r) => (r.id === record.id ? { ...r, favorite: true } : r))
        );
      }
    } catch (err) {
      console.error("즐겨찾기 토글 오류:", err);
    }
  };

  const handleDelete = async (recordId) => {
    try {
      await authFetch(`http://localhost:8080/running-record/${recordId}/delete`, {
        method: "PATCH",
      });
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
    }
  };
  // const handleDelete = async (recordId) => {
  //   try {
  //     await authFetch(`http://localhost:8080/running-record/${recordId}/delete`, {
  //       method: "PATCH",
  //     });
  //     setRecords((prev) =>
  //       prev.map((r) =>
  //         r.id === recordId ? { ...r, isDeleted: true } : r
  //       )
  //     );
  //   } catch (err) {
  //     console.error("❌ 삭제 실패:", err);
  //   }
  // };

  // const handleRestore = async (recordId) => {
  //   try {
  //     await authFetch(`http://localhost:8080/running-record/${recordId}/restore`, {
  //       method: "PATCH",
  //     });
  //     setRecords((prev) =>
  //       prev.map((r) =>
  //         r.id === recordId ? { ...r, isDeleted: false } : r
  //       )
  //     );
  //   } catch (err) {
  //     console.error("❌ 복구 실패:", err);
  //   }
  // };

  return (
    <div className={styles.container}>
      <h2>📜 나의 러닝 기록</h2>
      {records.length === 0 ? (
        <p>기록이 없습니다.</p>
      ) : (
        <ul className={styles.recordList}>
          {records.map((record) => (
            <li
              key={record.id}
              className={styles.recordItem}
              onClick={() => handleClick(record.id)}

              // onClick={() => !record.isDeleted && handleClick(record.id)}
              // style={{
              //   opacity: record.isDeleted ? 0.5 : 1,
              //   pointerEvents: record.isDeleted ? "none" : "auto",
              // }}
            >
              <p><strong>날짜:</strong> {new Date(record.createAt).toLocaleDateString()}</p>
              <p><strong>거리:</strong> {record.totalDistance} km</p>
              <p><strong>시간:</strong> {Math.floor(record.totalTime / 60)}분 {record.totalTime % 60}초</p>
              <p><strong>페이스:</strong> {record.pace}</p>
              <div className={styles.actions}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(record.id);
                  }}
                  className={styles.deleteButton}
                >
                  🗑️ 삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


              {/* <div className={styles.actions}>
                {record.isDeleted ? (
                  <button onClick={() => handleRestore(record.id)}>♻️ 복구</button>
                ) : (
                  <>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(record);
                      }}
                      style={{
                        cursor: "pointer",
                        fontSize: "20px",
                        color: record.favorite ? "gold" : "#ccc",
                      }}
                    >
                      ⭐
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(record.id);
                      }}
                      className={styles.deleteButton}
                    >
                      🗑️ 삭제
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  ); */}
// };

export default MyRecords;
