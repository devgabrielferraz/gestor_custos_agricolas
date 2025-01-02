from flask import Blueprint, request, jsonify
from database import connect_db

# Blueprint para receitas
receitas_bp = Blueprint('receitas', __name__)

# Rota para adicionar uma receita
@receitas_bp.route('/add', methods=['POST'])
def add_receita():
    data = request.json
    usuario_id = data.get('usuario_id')
    descricao = data.get('descricao')
    valor_entrada = data.get('valor_entrada')

    # Verificar se os campos obrigatórios estão preenchidos
    if not usuario_id or not descricao or not valor_entrada:
        return jsonify({"message": "Campos obrigatórios faltando"}), 400

    # Conectar ao banco de dados
    conn = connect_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO receitas (usuario_id, descricao, valor_entrada)
                VALUES (%s, %s, %s)
                RETURNING id
            """, (usuario_id, descricao, valor_entrada))

            # Pegar o ID gerado automaticamente
            receita_id = cursor.fetchone()[0]

            conn.commit()
            cursor.close()
            conn.close()

            return jsonify({"message": "Receita adicionada com sucesso", "id": receita_id}), 201
        except Exception as e:
            return jsonify({"message": f"Erro ao adicionar receita: {e}"}), 500
    else:
        return jsonify({"message": "Erro ao conectar ao banco de dados"}), 500

# Rota para listar receitas de um usuário
@receitas_bp.route('/list/<int:usuario_id>', methods=['GET'])
def list_receitas(usuario_id):
    conn = connect_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, descricao, valor_entrada
                FROM receitas
                WHERE usuario_id = %s
            """, (usuario_id,))
            receitas = cursor.fetchall()

            receitas_list = [
                {"id": r[0], "descricao": r[1], "valor_entrada": float(r[2])}
                for r in receitas
            ]

            cursor.close()
            conn.close()

            return jsonify({"receitas": receitas_list}), 200
        except Exception as e:
            return jsonify({"message": f"Erro ao buscar receitas: {e}"}), 500
    else:
        return jsonify({"message": "Erro ao conectar ao banco de dados"}), 500

# Rota para excluir uma receita
@receitas_bp.route('/delete/<int:receita_id>', methods=['DELETE'])
def delete_receita(receita_id):
    conn = connect_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                DELETE FROM receitas
                WHERE id = %s
            """, (receita_id,))
            conn.commit()

            cursor.close()
            conn.close()

            return jsonify({"message": "Receita excluída com sucesso"}), 200
        except Exception as e:
            return jsonify({"message": f"Erro ao excluir receita: {e}"}), 500
    else:
        return jsonify({"message": "Erro ao conectar ao banco de dados"}), 500
