import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NaviBar from "./components/navi-bar";
import Note from "./pages/Notes";

function App() {
  return (
    <Router>
      <div className="bg-background">
        <NaviBar />
        <Routes>
          <Route path="/" element={<Note />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
