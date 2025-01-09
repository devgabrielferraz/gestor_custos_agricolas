import React, { useState, useEffect } from "react";
import axios from "axios";
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

  // Função para buscar receitas do usuário
  const fetchReceitas = async () => {
    try {
      const usuarioId = 1; // ID do usuário temporário
      const response = await axios.get(`http://localhost:5000/receitas/list/${usuarioId}`);
      setReceitas(response.data.receitas);
    } catch (error) {
      console.error("Erro ao buscar receitas:", error);
    }
  };

  // Função para adicionar uma nova receita
  const addReceita = async () => {
    try {
      const usuarioId = 1; // ID do usuário temporário
      const response = await axios.post("http://localhost:5000/receitas/add", {
        usuario_id: usuarioId,
        descricao,
        valor_entrada: parseFloat(valorEntrada),
      });
      alert(response.data.message);
      setDescricao("");
      setValorEntrada("");
      fetchReceitas();
    } catch (error) {
      console.error("Erro ao adicionar receita:", error);
    }
  };

  // Função para excluir uma receita
  const deleteReceita = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/receitas/delete/${id}`);
      alert(response.data.message);
      fetchReceitas();
    } catch (error) {
      console.error("Erro ao excluir receita:", error);
    }
  };

  useEffect(() => {
    fetchReceitas();
  }, []);

  // Dados para o gráfico de receita bruta
  const receitaBrutaData = {
    labels: receitas.map((receita) => receita.descricao),
    datasets: [
      {
        label: "Receita Bruta (R$)",
        data: receitas.map((receita) => receita.valor_entrada),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Dados para o gráfico de receita líquida (exemplo básico)
  const receitaLiquidaData = {
    labels: receitas.map((receita) => receita.descricao),
    datasets: [
      {
        label: "Receita Líquida (R$)",
        data: receitas.map((receita) => receita.valor_entrada - 100), // Substituir "100" pelos gastos reais
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
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
              <td>{receita.valor_entrada.toFixed(2)}</td>
              <td>
                <button onClick={() => deleteReceita(receita.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="charts-container">
        <h2>Gráfico de Receita Bruta</h2>
        <Bar data={receitaBrutaData} />

        <h2>Gráfico de Receita Líquida</h2>
        <Bar data={receitaLiquidaData} />
      </div>
    </div>
  );
};

export default Receitas;