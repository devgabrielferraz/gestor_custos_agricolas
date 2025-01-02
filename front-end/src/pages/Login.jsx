import React, { useState } from 'react';
import "../styles/Login.css";

const LoginForm = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Novo estado para o campo Nome
  const [forgotPassword, setForgotPassword] = useState(false);

  const handleLogin = () => {
    // Fazer requisição ao back-end
    console.log('Login com:', { email, password });
  };

  const handleRegister = () => {
    // Fazer requisição ao back-end para cadastro
    console.log('Cadastro com:', { name, email, password });
  };

  const handlePasswordRecovery = () => {
    // Fazer requisição ao back-end para recuperação de senha
    console.log('Recuperação de senha para:', email);
  };

  return (
    <div className="auth-container">
      {!forgotPassword ? (
        <form className="auth-form">
          <h2>{isRegistering ? 'Cadastre-se grátis:' : 'Acesse sua conta:'}</h2>
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
          <button
            type="submit"
            onClick={isRegistering ? handleRegister : handleLogin}
          >
            {isRegistering ? 'Cadastrar' : 'Entrar'}
          </button>
          {!isRegistering && (
            <small onClick={() => setForgotPassword(true)}>
              Esqueci minha senha
            </small>
          )}
          <p>
            {isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            <span onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? ' Faça login.' : ' Cadastre-se aqui.'}
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
          <button type="submit" onClick={handlePasswordRecovery}>
            Enviar link de recuperação
          </button>
          <small onClick={() => setForgotPassword(false)}>Voltar</small>
        </form>
      )}
    </div>
  );
};

export default LoginForm;
