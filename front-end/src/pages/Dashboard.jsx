import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaClipboardList } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";
import Header from "../components/Header"; 
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Para exibir erros, se necessário
  //const navigate = useNavigate();  

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setErrorMessage("ID do usuário não encontrado no localStorage");
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/get_user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });

        const data = await response.json();

        if (response.ok) {
          setUserName(data.nome); // Atualizando o nome do usuário
        } else {
          setErrorMessage(data.error || "Erro ao buscar dados do usuário");
        }
      } catch (error) {
        setErrorMessage("Erro ao conectar ao servidor: " + error.message);
      }
    };

    fetchUserName();
  }, []);

  return (
    <div>
      <Header /> {/* Reutilizando o Header */}
      <div className="dashboard-container">
        <h1 className="dashboard-welcome">
          Bem-vindo, {userName || "Carregando..."}
        </h1>
        {errorMessage && <p className="dashboard-error">{errorMessage}</p>}
        <p>Esta é uma página protegida acessível apenas para usuários autenticados.</p>

        <div className="dashboard-links">
          <Link to="/insumos" className="dashboard-link">
            <FaClipboardList style={{ marginRight: "8px" }} />
            Gestão de Insumos
          </Link>
          <Link to="/servicos" className="dashboard-link">
            <FaClipboardList style={{ marginRight: "8px" }} />
            Gestão de Serviços
          </Link>
          <Link to="/receitas" className="dashboard-link">
            <FaChartLine style={{ marginRight: "8px" }} />
            Gerenciar Receitas da Fazenda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



