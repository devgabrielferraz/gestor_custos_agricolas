from flask import Flask
from flask_cors import CORS
from auth import auth_bp
from insumos import insumos_bp
from servicos import servicos_bp
from receitas import receitas_bp
from dotenv import load_dotenv
import os

app = Flask(__name__)
#Habilitar o CORS para o back-end
#CORS(app) - deixa acesseivel publicamente
CORS(app, origins=["https://gestor-custos-agricolas.vercel.app/"])

#Carregar as  variáveis do .env
load_dotenv()

# Configuração de segurança

#app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'minha-chave-secreta-padrao') - Usar Apenas no ambiente de desenvolvimento

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY") # Usar em ambiente de produção

# Registrar os módulos
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(insumos_bp, url_prefix='/insumos')
app.register_blueprint(servicos_bp, url_prefix='/servicos')
app.register_blueprint(receitas_bp, url_prefix='/receitas')


@app.route('/')
def home():
    return "API do Gestor de Custos Agrícolas está rodando (FinAgro)!"

 
if __name__ == '__main__':
    app.run(debug=True)
