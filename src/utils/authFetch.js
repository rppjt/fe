// src/utils/authFetch.js
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("accessToken");

  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    credentials: "include", // ✅ 쿠키도 포함 (refresh_token 자동 전송)
  };

  return fetch(url, config);
};
