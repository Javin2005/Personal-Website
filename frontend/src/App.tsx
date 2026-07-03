import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StatusBar from "./components/StatusBar";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Archive from "./pages/Archive";
import Life from "./pages/Life";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <div className="bg-slate-950 min-h-screen selection:bg-cyan-500/30">
        <StatusBar />
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/life" element={<Life />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
