const KakaoLoginButton = () => {
  const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const REDIRECT_URI = "http://localhost:5173/login/kakao";

  const handleLogin = () => {
    window.location.href =
      `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}` +
      `&redirect_uri=${REDIRECT_URI}&response_type=code`;
  };

  return (
    <button onClick={handleLogin} className="bg-yellow-300 px-4 py-2 rounded">
      카카오로 시작하기
    </button>
  );
};

export default KakaoLoginButton;
