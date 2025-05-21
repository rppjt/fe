/**
 * 위도/경도 두 점 사이의 거리를 미터(m) 단위로 반환합니다.
 * (Haversine 공식 사용)
 */
export function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // 지구 반지름 (m)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 경로(path) 배열을 GeoJSON LineString 형태로 변환합니다.
 * 예: [{ lat, lng }, ...] → { type: 'LineString', coordinates: [[lng, lat], ...] }
 */
export function convertPathToGeoJSON(path) {
  return {
    type: "LineString",
    coordinates: path.map((p) => [p.lng, p.lat]),
  };
}