from flask import Blueprint, request, jsonify
from database import connect_db
import bcrypt

auth_bp = Blueprint('auth', __name__)

# Cadastro de usuário
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    nome = data.get('nome')
    email = data.get('email')
    senha = data.get('senha')

    if not nome or not email or not senha:
        return jsonify({"message": "Todos os campos são obrigatórios"}), 400

    # Hash da senha
    hashed_password = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt())

    conn = connect_db()
    if conn:
        try:
            cursor = conn.cursor()
            # Verificar se o email já existe
            cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify({"message": "Email já registrado"}), 400

            # Inserir o novo usuário
            cursor.execute("""
                INSERT INTO usuarios (nome, email, senha)
                VALUES (%s, %s, %s)
            """, (nome, email, hashed_password.decode('utf-8')))
            conn.commit()

            cursor.close()
            conn.close()

            return jsonify({"message": "Usuário registrado com sucesso"}), 201
        except Exception as e:
            return jsonify({"message": f"Erro ao registrar usuário: {e}"}), 500
    else:
        return jsonify({"message": "Erro ao conectar ao banco de dados"}), 500


# Login de usuário
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    senha = data.get('senha')

    if not email or not senha:
        return jsonify({"message": "Todos os campos são obrigatórios"}), 400

    conn = connect_db()
    if conn:
        try:
            cursor = conn.cursor()
            # Verificar se o email existe
            cursor.execute("SELECT id, senha FROM usuarios WHERE email = %s", (email,))
            user = cursor.fetchone()
            if not user:
                return jsonify({"message": "Email não encontrado"}), 404

            user_id, hashed_password = user

            # Comparar a senha informada com o hash armazenado
            if bcrypt.checkpw(senha.encode('utf-8'), hashed_password.encode('utf-8')):
                return jsonify({"message": "Login bem-sucedido", "user_id": user_id}), 200
            else:
                return jsonify({"message": "Senha incorreta"}), 401
        except Exception as e:
            return jsonify({"message": f"Erro ao autenticar: {e}"}), 500
    else:
        return jsonify({"message": "Erro ao conectar ao banco de dados"}), 500
