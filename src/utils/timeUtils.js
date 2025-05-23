// src/utils/timeUtils.js
export const formatElapsedTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};


export const formatPace = (timeSec, distanceKm) => {
  if (distanceKm === 0) return "0'00\"";
  const paceSec = timeSec / distanceKm;
  const min = Math.floor(paceSec / 60);
  const sec = Math.floor(paceSec % 60);
  return `${min}'${sec.toString().padStart(2, "0")}"`;
};

