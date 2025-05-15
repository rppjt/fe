import "../pages/home.css";
import KakkoLoginButton from "../components/KakkoLoginButton";

const Home = () => {
  return (
    <div className="home-container">
      <img src="/home.jpg" alt="background" className="full-bg" />
      <div className="overlay">
        <h1 className="title">Runsh</h1>
        <KakkoLoginButton />
      </div>
    </div>
  );
};

export default Home;
