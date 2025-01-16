import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header"; 
import "../styles/Insumos.css";

const Insumos = () => {
  const [insumo, setInsumo] = useState("");
  const [insumos, setInsumos] = useState([]);
  const [quantidadeTotal, setQuantidadeTotal] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [dataCompra, setDataCompra] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [planilha, setPlanilha] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");

  const calcularValorTotal = (quantidade, valorUnitario) => {
    return (quantidade * valorUnitario).toFixed(2);
  };

  const calcularValorTotalInsumos = () => {
    return planilha
      .reduce((total, item) => total + parseFloat(item.valorTotal || 0), 0)
      .toFixed(2);
  };


  // Carregar insumos do banco de dados ao montar o componente
  useEffect(() => {
    const fetchInsumos = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/insumos`, {
          params: {
            usuario_id: localStorage.getItem("userId"),
          },
        });

        if (response.status === 200) {
          const data = response.data;
  
          if (Array.isArray(data)) {
            const formattedData = data.map((item) => ({
              id: item.id,
              insumo: item.insumo,
              quantidadeTotal: item.quantidade_total,
              valorUnitario: item.valor_unitario,
              valorTotal: item.valor_total,
              dataCompra: item.data_compra,
              dataPagamento: item.data_pagamento,
            }));
            setPlanilha(formattedData);
          } else {
            setMensagemErro("Dados recebidos não estão no formato esperado.");
          }
        } else {
          setMensagemErro("Erro ao carregar os insumos.");
        }
      } catch (error) {
        setMensagemErro("Erro ao conectar ao servidor: " + error.message);
      }
    };
  
    fetchInsumos();
  }, []);
  

  const handleAdicionarInsumo = async () => {
    if (!insumo || !quantidadeTotal || !valorUnitario || !dataCompra || !dataPagamento) {
      setMensagemErro("Todos os campos devem ser preenchidos.");
      return;
    }

    const novoInsumo = {
      insumo,
      quantidadeTotal: parseFloat(quantidadeTotal),
      valorUnitario: parseFloat(valorUnitario),
      valorTotal: calcularValorTotal(quantidadeTotal, valorUnitario),
      dataCompra,
      dataPagamento,
    };

    try {
      const response = await axios.post("http://localhost:5000/insumos/add", {
        usuario_id: localStorage.getItem("userId"),
        insumo: novoInsumo.insumo,
        quantidade_total: novoInsumo.quantidadeTotal,
        valor_unitario: novoInsumo.valorUnitario,
        data_compra: novoInsumo.dataCompra,
        data_pagamento: novoInsumo.dataPagamento,
      });

      if (response.status === 201) {
        setPlanilha([...planilha, { ...novoInsumo, id: response.data.id }]);
        limparCampos();
      } else {
        setMensagemErro(response.data.message || "Erro ao adicionar insumo.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar ao servidor: " + error.message);
    }
  };

    const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00'); // Força a data para evitar ajustes de fuso
    return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };
  

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este insumo?")) {
      try {
        const response = await axios.delete(`http://localhost:5000/insumos/${id}`);
        if (response.status === 200) {
          setPlanilha((prev) => prev.filter((insumo) => insumo.id !== id));
          alert("Insumo excluído com sucesso!");
        } else {
          alert("Erro ao excluir o insumo.");
        }
      } catch (error) {
        alert("Erro ao excluir o insumo: " + error.message);
      }
    }
  };

  const limparCampos = () => {
    setInsumo("");
    setQuantidadeTotal("");
    setValorUnitario("");
    setDataCompra("");
    setDataPagamento("");
    setMensagemErro("");
  };

  return (
    <div className="page-content">
      <Header /> {/* Reutilizando o Header */}
    <div className="insumos-container">
      <h1>Cadastro de Insumos</h1>

      {mensagemErro && <p className="error-message">{mensagemErro}</p>}

      <div className="form-insumos">
        <label>Nome do Insumo:</label>
        <input
          type="text"
          value={insumo}
          onChange={(e) => setInsumo(e.target.value)}
          placeholder="Ex.: Fertilizante"
        />

        <label>Quantidade Total (kg/l):</label>
        <input
          type="number"
          value={quantidadeTotal}
          onChange={(e) => setQuantidadeTotal(e.target.value)}
          placeholder="Ex.: 100"
        />

        <label>Valor Unitário (R$):</label>
        <input
          type="number"
          value={valorUnitario}
          onChange={(e) => setValorUnitario(e.target.value)}
          placeholder="Ex.: 50.00"
        />

        <label>Data da Compra:</label>
        <input
          type="date"
          value={dataCompra}
          onChange={(e) => setDataCompra(e.target.value)}
        />

        <label>Data do Pagamento:</label>
        <input
          type="date"
          value={dataPagamento}
          onChange={(e) => setDataPagamento(e.target.value)}
        />

        <button onClick={handleAdicionarInsumo} className="btn-adicionar">
          Adicionar Insumo
        </button>
      </div>

      <h2>Planilha de Insumos</h2>
      <table className="planilha">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Quantidade (kg/l)</th>
            <th>Valor Unitário (R$)</th>
            <th>Valor Total (R$)</th>
            <th>Data da Compra</th>
            <th>Data do Pagamento</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {planilha.map((item) => (
            <tr key={item.id}>
              <td>{item.insumo}</td>
              <td>{item.quantidadeTotal}</td>
              <td>{item.valorUnitario}</td>
              <td>{item.valorTotal}</td>
              <td>{formatDate(item.dataCompra)}</td>
              <td>{formatDate(item.dataPagamento)}</td>
              <td>
                <button className= "excluir" onClick={() => handleDelete(item.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="1" style={{ textAlign: "left", fontWeight: "bold" }}>Valor Total:</td>
            <td colSpan="4" style={{ textAlign: "left", fontWeight: "bold" }}>R$ {calcularValorTotalInsumos()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    </div>
  );
};

export default Insumos;
