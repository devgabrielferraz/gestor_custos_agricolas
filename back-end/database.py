import psycopg2
from psycopg2 import sql
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, ForeignKey, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from dotenv import load_dotenv
import os

# Carregar variáveis do arquivo .env
load_dotenv()

# Configuração do banco de dados com variáveis do .env
DATABASE_NAME = os.getenv('DATABASE_NAME')
DATABASE_USER = os.getenv('DATABASE_USER')
DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD')
DATABASE_HOST = os.getenv('DATABASE_HOST')
DATABASE_PORT = os.getenv('DATABASE_PORT')

# Função para conectar ao banco de dados
def connect_db():
    try:
        connection = psycopg2.connect(
            dbname=DATABASE_NAME,
            user=DATABASE_USER,
            password=DATABASE_PASSWORD,
            host=DATABASE_HOST,
            port=DATABASE_PORT
        )
        return connection
    except psycopg2.Error as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return None


# URL de conexão do SQLAlchemy
DATABASE_URL = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"

# Configuração do SQLAlchemy
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Função para obter uma sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Modelos (tabelas do banco de dados)
class Insumo(Base):
    __tablename__ = 'insumos'
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    insumo = Column(String(255), nullable=False)
    quantidade_total = Column(Numeric(10, 2), nullable=False)
    valor_unitario = Column(Numeric(10, 2), nullable=False)
    valor_total = Column(Numeric(10, 2), nullable=False)  # Será gerado no banco
    data_compra = Column(Date, nullable=False)
    data_pagamento = Column(Date, nullable=False)

class Servico(Base):
    __tablename__ = 'servicos'
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    descricao = Column(String(255), nullable=False)
    valor_total = Column(Numeric(10, 2), nullable=False)
    data_servico = Column(Date, nullable=False)
    data_pagamento = Column(Date, nullable=False)

class Receita(Base):
    __tablename__ = 'receitas'
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    descricao = Column(String(255), nullable=False)
    valor_entrada = Column(Numeric(10, 2), nullable=False)

__all__ = ["connect_db", "Insumo", "Servico", "Receita", "get_db"]
