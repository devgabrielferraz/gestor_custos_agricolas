import React from "react";
import { useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { ImExit } from "react-icons/im";
import "../styles/Header.css"; // O CSS pode ser extraído de Dashboard.css

const Header = () => {
  const navigate = useNavigate();

  // Função de logout
  const handleLogout = () => {
    localStorage.removeItem("userId"); // Remove o userId do localStorage
    navigate("/"); // Redireciona para a página de login
  };

  // Função de redirecionamento para o painel de controle
  const handleGoToDashboard = () => {
    navigate("/dashboard"); // Redireciona para a página do dashboard
  };

  return (
    <header className="header-dashboard">
      <button onClick={handleGoToDashboard} className="control-panel-btn">
        <MdDashboard style={{ marginRight: "10px" }} />
        Painel de Controle
      </button>
      <button onClick={handleLogout} className="logout-btn">
        <ImExit style={{ marginRight: "10px" }} />
        Sair
      </button>
    </header>
  );
};

export default Header;
