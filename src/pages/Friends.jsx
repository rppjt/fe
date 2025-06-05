// src/pages/Friends.jsx
import { useState, useEffect } from "react";
import { useAuthFetch } from "../utils/useAuthFetch";
import styles from "./myPage.module.css";

const Friends = () => {
  const authFetch = useAuthFetch();
  const [friends, setFriends] = useState([]);
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [isSharingLocation, setIsSharingLocation] = useState(false);

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

  // 위치 공유 토글
  const toggleLocationSharing = async () => {
    try {
      const res = await authFetch("http://localhost:8080/friends/share-location", {
        method: isSharingLocation ? "DELETE" : "POST",
      });

      if (res.ok) {
        setIsSharingLocation(!isSharingLocation);
      }
    } catch (err) {
      console.error("위치 공유 토글 실패:", err);
    }
  };

  const [showFriendsOnMap, setShowFriendsOnMap] = useState(() => {
  // 초기값을 localStorage에서 불러오기
    const stored = localStorage.getItem("showFriendsOnMap");
    return stored === null ? true : stored === "true";
  });

// 토글 핸들러
  const handleToggleShowFriends = () => {
    const newValue = !showFriendsOnMap;
    setShowFriendsOnMap(newValue);
    localStorage.setItem("showFriendsOnMap", newValue); // 저장
  };



  /*
  const fetchSharingStatus = async () => {
    try {
        const res = await authFetch("http://localhost:8080/friends/share-location");
        if (!res.ok) throw new Error("공유 상태 불러오기 실패");
        const data = await res.json(); // 예: { isSharing: true }
        setIsSharingLocation(data.isSharing);
    } catch (err) {
        console.error("위치 공유 상태 조회 실패:", err);
        }
    };
   */

  // input focus (닉네임 추가 후)
  useEffect(() => {
    if (nickname === "") {
      document.querySelector("input[placeholder='닉네임으로 친구 추가']")?.focus();
    }
  }, [nickname]);

  // 친구 목록 불러오기
  useEffect(() => {
    fetchFriends();
    //fetchSharingStatus();
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
              <span>
                {friend.nickname} ({friend.email})
              </span>
              <button onClick={() => handleDeleteFriend(friend.id)}>❌ 삭제</button>
            </li>
          ))
        )}
      </ul>

      <div className={styles.toggleContainer}>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={isSharingLocation}
            onChange={toggleLocationSharing}
          />
          <span className={styles.slider}></span>
        </label>
        <span className={styles.toggleLabel}>
          내 위치 친구에게 공유 {isSharingLocation ? "(ON)" : "(OFF)"}
        </span>
      </div>

      <div className={styles.toggleContainer}>
      <label className={styles.switch}>
        <input
          type="checkbox"
          checked={showFriendsOnMap}
          onChange={handleToggleShowFriends}
        />
        <span className={styles.slider}></span>
      </label>
      <span className={styles.toggleLabel}>
        지도에 친구 위치 표시 {showFriendsOnMap ? "(ON)" : "(OFF)"}
    </span>
</div>
    </div>
  );
};

export default Friends;
