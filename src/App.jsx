import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loginpage from "./pages/Loginpage";
import LoginKakaoCallback from "./pages/LoginKakkoCallback";
import Home from "./pages/home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Loginpage />} />
        <Route path="/login/callback" element={<LoginKakaoCallback />} />
        <Route path="/home" element={<Home />} />
      </Routes>ß
    </BrowserRouter>
  );
}

export default App;