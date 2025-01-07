import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'; // Importando o hook para navegação
import "../styles/Login.css";

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [message, setMessage] = useState(""); // Para mensagens de erro/sucesso

  const API_URL = "http://localhost:5000/auth"; // URL do back-end

  const navigate = useNavigate(); // Hook de navegação

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); // Limpar mensagens anteriores
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Login realizado com sucesso!");
        localStorage.setItem("userId", data.user_id); 
        navigate("/dashboard");
        // Redirecionar ou salvar o token/session aqui
      } else {
        setMessage(data.message || "Erro ao fazer login.");
      }
    } catch (error) {
      setMessage("Erro ao conectar ao servidor.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: name, email, senha: password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Cadastro realizado com sucesso!");
        setIsRegistering(false); // Voltar ao modo de login
      } else {
        setMessage(data.message || "Erro ao cadastrar.");
      }
    } catch (error) {
      setMessage("Erro ao conectar ao servidor.");
    }
  };

  return (
    <div className="auth-container">
      {!forgotPassword ? (
        <form className="auth-form" onSubmit={isRegistering ? handleRegister : handleLogin}>
          <h2>{isRegistering ? "Cadastre-se grátis:" : "Acesse sua conta:"}</h2>
          {message && <p className="auth-message">{message}</p>}
          {isRegistering && (
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">
            {isRegistering ? "Cadastrar" : "Entrar"}
          </button>
          {!isRegistering && (
            <small onClick={() => setForgotPassword(true)}>Esqueci minha senha</small>
          )}
          <p>
            {isRegistering ? "Já tem uma conta?" : "Não tem uma conta?"}
            <span onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? " Faça login." : " Cadastre-se aqui."}
            </span>
          </p>
        </form>
      ) : (
        <form className="auth-form">
          <h2>Recuperação de Senha</h2>
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar link de recuperação</button>
          <small onClick={() => setForgotPassword(false)}>Voltar</small>
        </form>
      )}
    </div>
  );
};

export default Login;
