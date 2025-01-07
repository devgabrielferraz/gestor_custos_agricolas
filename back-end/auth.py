from flask import Blueprint, request, jsonify
import bcrypt
from database import connect_db  # Atualize para o nome real do módulo que conecta ao banco de dados

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/get_user', methods=['POST'])
def get_user():
    data = request.get_json()  # Corrigido para request.get_json() em vez de request.json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "ID do usuário não fornecido"}), 400

    try:
        connection = connect_db()
        if connection is None:
            return jsonify({"error": "Erro ao conectar ao banco de dados"}), 500

        cursor = connection.cursor()
        query = """
            SELECT nome 
            FROM usuarios 
            WHERE id = %s;
        """
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()

        if result:
            nome_usuario = result[0]
            return jsonify({"nome": nome_usuario}), 200
        else:
            return jsonify({"error": "Usuário não encontrado"}), 404
    except Exception as e:
        return jsonify({"error": f"Erro ao buscar dados do usuário: {str(e)}"}), 500
    finally:
        if connection:
            connection.close()

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        nome = data.get('nome')
        email = data.get('email')
        senha = data.get('senha')

        if not nome or not email or not senha:
            return jsonify({"message": "Todos os campos são obrigatórios"}), 400

        hashed_password = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt())
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"message": "Email já registrado"}), 400
        cursor.execute("INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s)",
                       (nome, email, hashed_password.decode('utf-8')))
        conn.commit()
        return jsonify({"message": "Usuário registrado com sucesso"}), 201
    except Exception as e:
        return jsonify({"message": f"Erro ao registrar usuário: {e}"}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        senha = data.get('senha')

        if not email or not senha:
            return jsonify({"message": "Todos os campos são obrigatórios"}), 400

        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, senha FROM usuarios WHERE email = %s", (email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"message": "Email não encontrado"}), 404

        user_id, hashed_password = user
        if bcrypt.checkpw(senha.encode('utf-8'), hashed_password.encode('utf-8')):
            return jsonify({"message": "Login bem-sucedido", "user_id": user_id}), 200
        else:
            return jsonify({"message": "Senha incorreta"}), 401
    except Exception as e:
        return jsonify({"message": f"Erro ao autenticar: {e}"}), 500
