import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Rooms } from "./pages/Rooms";
import { Room } from "./pages/Room";
import { useStore } from "./store";
import './App.css';
function App() {
  const user = useStore((state) => state.user);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={user ? "/rooms" : "/login"} />}
        />
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/rooms" />}
        />
        <Route
          path="/signup"
          element={!user ? <Signup /> : <Navigate to="/rooms" />}
        />
        <Route
          path="/rooms"
          element={user ? <Rooms /> : <Navigate to="/login" />}
        />
        <Route
          path="/rooms/:id"
          element={user ? <Room /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
