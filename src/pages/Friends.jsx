// src/pages/Friends.jsx
import { useState, useEffect } from "react";
import { useAuthFetch } from "../utils/useAuthFetch";
import styles from "./myPage.module.css";

const Friends = () => {
  const authFetch = useAuthFetch();
  const [friends, setFriends] = useState([]);
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  // 친구 목록 불러오기
  const fetchFriends = async () => {
    try {
      const res = await authFetch("http://localhost:8080/friends");
      if (!res.ok) throw new Error("친구 목록 불러오기 실패");
      const data = await res.json();
      setFriends(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 친구 추가
  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    try {
      const res = await authFetch("http://localhost:8080/friends", {
        method: "POST",
        body: JSON.stringify({ nickname }),
      });

      if (res.ok) {
        setNickname("");
        setError("");
        fetchFriends();
      } else {
        const errorMsg = await res.text();
        setError(errorMsg || "친구 추가 실패");
      }
    } catch (err) {
      console.error(err);
      setError("친구 추가 중 오류 발생");
    }
  };

  // 친구 삭제
  const handleDeleteFriend = async (id) => {
    try {
      const res = await authFetch(`http://localhost:8080/friends/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFriends((prev) => prev.filter((f) => f.id !== id));
      } else {
        console.error("친구 삭제 실패");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <div className={styles.friendsContainer}>
      <h2>👥 내 친구 목록</h2>

      <form onSubmit={handleAddFriend} className={styles.friendForm}>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임으로 친구 추가"
        />
        <button type="submit">➕ 추가</button>
      </form>
      {error && <p className={styles.errorText}>❗ {error}</p>}

      <ul className={styles.friendList}>
        {friends.length === 0 ? (
          <p>아직 친구가 없습니다.</p>
        ) : (
          friends.map((friend) => (
            <li key={friend.id} className={styles.friendItem}>
              <span>{friend.nickname} ({friend.email})</span>
              <button onClick={() => handleDeleteFriend(friend.id)}>❌ 삭제</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Friends;
