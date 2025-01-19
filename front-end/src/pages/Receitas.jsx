import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header"; 
import "../styles/Receitas.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Receitas = () => {
  const [receitas, setReceitas] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [valorEntrada, setValorEntrada] = useState("");
  const [graficoDados, setGraficoDados] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar receitas do usuário
  const fetchReceitas = async () => {
    try {
      const usuarioId = localStorage.getItem("userId");
      if (!usuarioId) {
        console.error("ID do usuário não encontrado. Certifique-se de que o usuário está logado.");
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/receitas/${usuarioId}`);
      setReceitas(response.data);
    } catch (error) {
      console.error("Erro ao buscar receitas:", error);
    }
  };

  // Função para buscar dados do gráfico
const fetchGraficoDados = async () => {
  try {
    const usuarioId = localStorage.getItem("userId");
    if (!usuarioId) {
      console.error("ID do usuário não encontrado. Certifique-se de que o usuário está logado.");
      return;
    }

    //console.log("ID do usuário sendo enviado:", usuarioId); // Debug

    const response = await axios.get(`${import.meta.env.VITE_API_URL}/receitas/dados-receita`, {
      headers: { "X-Usuario-ID": usuarioId }, // Cabeçalho correto
    });

    //console.log("Resposta recebida do backend:", response.data); // Debug
    setGraficoDados({
      receitaBruta: Number(response.data.receita_bruta) || 0,
      totalInsumos: Number(response.data.total_insumos) || 0,
      totalServicos: Number(response.data.total_servicos) || 0,
      receitaLiquida: Number(response.data.receita_liquida) || 0,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do gráfico:", error);
  } finally {
    setLoading(false);
  }
};

  // Função para adicionar uma nova receita
  const addReceita = async () => {
    try {
      const usuarioId = localStorage.getItem("userId");
      if (!usuarioId) {
        console.error("ID do usuário não encontrado. Certifique-se de que o usuário está logado.");
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/receitas/add`, {
        usuario_id: usuarioId,
        descricao,
        valor_entrada: parseFloat(valorEntrada),
      });
      alert(response.data.message);
      setDescricao("");
      setValorEntrada("");
      fetchReceitas();
      fetchGraficoDados();
    } catch (error) {
      console.error("Erro ao adicionar receita:", error);
    }
  };

  // Função para excluir uma receita
  const deleteReceita = async (id) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/receitas/${id}`);
      alert(response.data.message);
      fetchReceitas();
      fetchGraficoDados();
    } catch (error) {
      console.error("Erro ao excluir receita:", error);
    }
  };

  useEffect(() => {
    fetchReceitas();
    fetchGraficoDados();
  }, []);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!graficoDados) {
    return <p>Erro ao carregar os dados do gráfico. Tente novamente mais tarde.</p>;
  }

  // Dados para o gráfico de receita líquida
  const receitaLiquidaData = {
    labels: ["Receita Bruta", "Total Insumos", "Total Serviços", "Receita Líquida"],
    datasets: [
      {
        label: "Valores (R$)",
        data: [
          graficoDados.receitaBruta,
          graficoDados.totalInsumos,
          graficoDados.totalServicos,
          graficoDados.receitaLiquida,
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="page-content">
      <Header /> {/* Reutilizando o Header */}
    
    <div className="receitas-container">
      <h1>Gestão de Receitas</h1>

      <div className="form-container">
        <input
          type="text"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <input
          type="number"
          placeholder="Valor de Entrada"
          value={valorEntrada}
          onChange={(e) => setValorEntrada(e.target.value)}
        />
        <button onClick={addReceita}>Adicionar Receita</button>
      </div>

      <table className="receitas-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Valor (R$)</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {receitas.map((receita) => (
            <tr key={receita.id}>
              <td>{receita.descricao}</td>
              <td>{Number(receita.valor_entrada).toFixed(2)}</td>
              <td>
                <button className= "excluir" onClick={() => deleteReceita(receita.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="charts-container">
        <h2>Gráfico de Receita</h2>
        <Bar data={receitaLiquidaData} />
      </div>
    </div>
    </div>
  );
};

export default Receitas;
