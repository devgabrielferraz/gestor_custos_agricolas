import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // Comentei porque ainda não existe
import Insumos from "./pages/Insumos";
import ProtectedRoute from "./components/ProtectedRoute"; // Mantenha comentado se ainda não implementado

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/insumos" element={<ProtectedRoute><Insumos /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
