// src/contexts/LocationContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext"; // ✅ accessToken 가져오기
import { useAuthFetch } from "../utils/useAuthFetch";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const authFetch = useAuthFetch();
  const { accessToken } = useAuth(); // ✅ 추가

  const [isSharing, setIsSharing] = useState(false);
  const [showFriendsOnMap, setShowFriendsOnMap] = useState(() => {
    const stored = localStorage.getItem("showFriendsOnMap");
    return stored === null ? true : stored === "true";
  });

  // ✅ 서버에서 위치 공유 상태 가져오기
  useEffect(() => {
    if (!accessToken) return; // ✅ accessToken 없으면 skip

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
  }, [accessToken]); // ✅ accessToken 변동 시에도 다시 시도

  // ✅ 위치 공유 상태 서버에 반영
  const toggleSharing = async () => {
    const next = !isSharing;
    try {
      const res = await authFetch("http://localhost:8080/location/sharing", {
        method: "PATCH",
        body: JSON.stringify({ isSharing: next }), // ✅ 백엔드 DTO에 맞춤
      });
      if (!res.ok) throw new Error();
      setIsSharing(next);
    } catch (err) {
      console.error("📛 위치 공유 전송 실패:", err);
    }
  };

  // ✅ 친구 마커 보기 상태 (로컬 전용)
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
