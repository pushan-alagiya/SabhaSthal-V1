import { Routes, Route } from "react-router-dom";
import "./App.css";
import EntryScreen from "./screens/Entry";
import RoomPage from "./screens/Room";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<EntryScreen />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </div>
  );
}

export default App;
