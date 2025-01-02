from flask import Flask
from insumos import insumos_bp
from servicos import servicos_bp
from receitas import receitas_bp


app = Flask(__name__)

# Registrar os módulos
app.register_blueprint(insumos_bp, url_prefix='/insumos')
app.register_blueprint(servicos_bp, url_prefix='/servicos')
app.register_blueprint(receitas_bp, url_prefix='/receitas')

@app.route('/')
def home():
    return "API do Gestor de Custos Agrícolas está rodando (FinAgro)!"

if __name__ == '__main__':
    app.run(debug=True)
