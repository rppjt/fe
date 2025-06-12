import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useAuthFetch } from "../utils/useAuthFetch";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const authFetch = useAuthFetch();
  const { accessToken } = useAuth();

  const [isSharing, setIsSharing] = useState(false);
  const [showFriendsOnMap, setShowFriendsOnMap] = useState(() => {
    const stored = localStorage.getItem("showFriendsOnMap");
    return stored === null ? true : stored === "true";
  });

  // ✅ 위치 공유 상태 불러오기
  useEffect(() => {
    if (!accessToken) return;

    const fetchSharingStatus = async () => {
      try {
        const res = await authFetch("http://localhost:8080/location/sharing");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setIsSharing(data.isSharing);
      } catch (err) {
        console.error("📛 위치 공유 상태 불러오기 실패", err);
      }
    };

    fetchSharingStatus();
  }, [accessToken]);

  // ✅ 위치 공유 상태 토글 + 사용자 메시지 출력
  const toggleSharing = async () => {
    const next = !isSharing;
    try {
      const res = await authFetch("http://localhost:8080/location/sharing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSharing: next }),
      });
      if (!res.ok) throw new Error();

      const result = await res.json(); // ✅ 응답 파싱
      setIsSharing(result.isSharing);

      // ✅ 사용자에게 메시지 출력
      if (result.message) {
        alert(result.message); // 👉 또는 toast(result.message)
      }
    } catch (err) {
      console.error("📛 위치 공유 전송 실패:", err);
      alert("❌ 위치 공유 상태 변경에 실패했습니다.");
    }
  };

  const toggleShowFriends = () => {
    const next = !showFriendsOnMap;
    setShowFriendsOnMap(next);
    localStorage.setItem("showFriendsOnMap", next.toString());
  };

  return (
    <LocationContext.Provider
      value={{
        isSharing,
        toggleSharing,
        showFriendsOnMap,
        toggleShowFriends,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
