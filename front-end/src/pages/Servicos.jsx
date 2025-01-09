import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/Servicos.css";

const Servicos = () => {
  const [servicos, setServicos] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [dataServico, setDataServico] = useState('');
  const [dataPagamento, setDataPagamento] = useState('');

  
  // Função para buscar os serviços
  const fetchServicos = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/servicos`, {
        params: {
          usuario_id: localStorage.getItem('userId'),
        },
      });
      setServicos(response.data);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  // Função para adicionar um serviço
  const handleAddServico = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/servicos/add`, {
        usuario_id: localStorage.getItem("userId"),
        descricao,
        valor_total: valorTotal,
        data_servico: dataServico,
        data_pagamento: dataPagamento,
      });
      setServicos([...servicos, { id: response.data.id, descricao, valor_total: parseFloat(valorTotal), data_servico: dataServico, data_pagamento: dataPagamento }]);
      setDescricao('');
      setValorTotal('');
      setDataServico('');
      setDataPagamento('');
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) {
      return "Data inválida";
    }
    return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  // Função para excluir um serviço
  const handleDeleteServico = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/servicos/${id}`);
      setServicos(servicos.filter((servico) => servico.id !== id));
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
    }
  };

  // Calcula o valor total dos serviços
  const calcularValorTotalServicos = () => {
    return servicos.reduce((total, servico) => total + parseFloat(servico.valor_total || 0), 0).toFixed(2);
  };

  return (
    <div className="servicos-container">
      <h1>Serviços</h1>
      <div className="form-servicos">
        <label>Descrição:</label>
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição do serviço"
          required
        />
        <label>Valor Total:</label>
        <input
          type="number"
          value={valorTotal}
          onChange={(e) => setValorTotal(e.target.value)}
          placeholder="Valor total"
          required
        />
        <label>Data do Serviço:</label>
        <input
          type="date"
          value={dataServico}
          onChange={(e) => setDataServico(e.target.value)}
          required
        />
        <label>Data de Pagamento:</label>
        <input
          type="date"
          value={dataPagamento}
          onChange={(e) => setDataPagamento(e.target.value)}
          required
        />
        <button onClick={handleAddServico} className="btn-adicionar">
          Adicionar Serviço
        </button>
      </div>

      <table className="servicos-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Valor Total</th>
            <th>Data do Serviço</th>
            <th>Data de Pagamento</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {servicos.map((servico) => (
            <tr key={servico.id}>
              <td>{servico.descricao}</td>
              <td>{servico.valor_total}</td>
              <td>{formatDate(servico.data_servico)}</td>
              <td>{formatDate(servico.data_pagamento)}</td>
              <td>
                <button onClick={() => handleDeleteServico(servico.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="1" style={{ textAlign: "left", fontWeight: "bold" }}>Valor Total:</td>
            <td colSpan="4" style={{ textAlign: "left", fontWeight: "bold" }}>R$ {calcularValorTotalServicos()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default Servicos;
