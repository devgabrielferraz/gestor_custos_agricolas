import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Insumos from "./pages/Insumos";
import Servicos from "./pages/Servicos";
import Receitas from "./pages/Receitas";
import ProtectedRoute from "./components/ProtectedRoute"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/insumos" element={<ProtectedRoute><Insumos /></ProtectedRoute>} />
        <Route path="/servicos" element={<ProtectedRoute><Servicos /></ProtectedRoute>} />
        <Route path="/receitas" element={<ProtectedRoute><Receitas /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
