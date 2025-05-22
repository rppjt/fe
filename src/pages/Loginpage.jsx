import "../pages/Loginpage.css";
import KakkoLoginButton from "../components/KakkoLoginButton";

const Loginpage = () => {
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

export default Loginpage;