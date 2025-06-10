import { useEffect, useState } from "react";
import { useAuthFetch } from "../utils/useAuthFetch";
import styles from "./myPage.module.css";

const Friends = () => {
  const authFetch = useAuthFetch();
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [error, setError] = useState("");

  // 친구 목록 및 요청 정보 불러오기
  const fetchAllData = async () => {
    try {
      const [friendsRes, receivedRes, sentRes] = await Promise.all([
        authFetch("http://localhost:8080/friends"),
        authFetch("http://localhost:8080/friends/request/received"),
        authFetch("http://localhost:8080/friends/request/sent"),
      ]);

      if (!friendsRes.ok || !receivedRes.ok || !sentRes.ok) {
        throw new Error("데이터 요청 실패");
      }

      const [friendsData, receivedData, sentData] = await Promise.all([
        friendsRes.json(),
        receivedRes.json(),
        sentRes.json(),
      ]);

      setFriends(friendsData);
      setReceivedRequests(receivedData);
      setSentRequests(sentData);
    } catch (err) {
      console.error("❌ 친구 데이터 불러오기 실패:", err);
      setError("친구 데이터를 불러오는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAccept = async (requesterId) => {
    try {
      const res = await authFetch(`http://localhost:8080/friends/request/accept/${requesterId}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("수락 실패");
      alert("✅ 친구 요청을 수락했습니다.");
      fetchAllData();
    } catch (err) {
      console.error("❌ 수락 실패:", err);
    }
  };

  const handleReject = async (requesterId) => {
    try {
      const res = await authFetch(`http://localhost:8080/friends/request/reject/${requesterId}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("거절 실패");
      alert("🚫 친구 요청을 거절했습니다.");
      fetchAllData();
    } catch (err) {
      console.error("❌ 거절 실패:", err);
    }
  };

  const handleDelete = async (friendId) => {
    if (!window.confirm("정말 친구를 삭제하시겠습니까?")) return;

    try {
      const res = await authFetch(`http://localhost:8080/friends/${friendId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("삭제 실패");
      alert("🗑️ 친구가 삭제되었습니다.");
      fetchAllData();
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
    }
  };

  return (
    <div className={styles.container}>
      <h2>👥 친구 목록</h2>
      {friends.map((f) => (
        <div key={f.friendId} className={styles.friendCard}>
          <img src={f.profileImage} alt="프로필" className={styles.profileImg} />
          <span>{f.name}</span>
          <button onClick={() => handleDelete(f.friendId)}>삭제</button>
        </div>
      ))}

      <h3>📨 받은 친구 요청</h3>
      {receivedRequests.map((req) => (
        <div key={req.requesterId} className={styles.friendCard}>
          <img src={req.profileImage} alt="프로필" className={styles.profileImg} />
          <span>{req.name}</span>
          <button onClick={() => handleAccept(req.requesterId)}>수락</button>
          <button onClick={() => handleReject(req.requesterId)}>거절</button>
        </div>
      ))}

      <h3>📤 보낸 친구 요청</h3>
      {sentRequests.map((req) => (
        <div key={req.targetId} className={styles.friendCard}>
          <img src={req.profileImage} alt="프로필" className={styles.profileImg} />
          <span>{req.name}</span>
          <span className={styles.pending}>⏳ 대기중</span>
        </div>
      ))}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default Friends;
