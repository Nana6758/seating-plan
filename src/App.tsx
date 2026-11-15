import SeatingEditor from "./pages/SeatingEditor";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Signup from "./pages/signup";
import ImportStudents from "./pages/ImportStudents";

import "./App.css";

function SignedIn() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">
            <ArmchairIcon />
          </div>
          <h1>SeatPlan</h1>
        </div>

        <h2 className="success-heading">Sign in successful</h2>

        <p className="success-text">
          Your account is connected. The seating workspace will be added in the
          next development stage.
        </p>
      </div>
    </div>
  );
}

function ArmchairIcon() {
  return <span>✓</span>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signed-in" element={<ImportStudents />} />
        <Route path="/import-students" element={<ImportStudents />} />
        <Route path="/seating-editor" element={<SeatingEditor />} />
        <Route path="/signed-in" element={<SignedIn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
