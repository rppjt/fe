export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("accessToken");

  const config = {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  };

  return fetch(url, config);
};
