from flask import Blueprint, request, jsonify
from database import connect_db

servicos_bp = Blueprint('servicos', __name__)

# Rota para adicionar um serviço
@servicos_bp.route('/add', methods=['POST'])
def add_servico():
    data = request.json
    usuario_id = data.get('usuario_id')
    descricao = data.get('descricao')
    valor_total = data.get('valor_total')

    # Validar campos obrigatórios
    if not usuario_id or not descricao or not valor_total:
        return jsonify({"message": "Campos obrigatórios faltando"}), 400

    # Validar valor numérico
    try:
        valor_total = float(valor_total)
    except ValueError:
        return jsonify({"message": "Valor total deve ser um número válido"}), 400

    # Conectar ao banco de dados
    conn = connect_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO servicos (usuario_id, descricao, valor_total)
                VALUES (%s, %s, %s)
                RETURNING id
            """, (usuario_id, descricao, valor_total))

            # Pegar o ID gerado automaticamente
            servico_id = cursor.fetchone()[0]
            conn.commit()
            cursor.close()
            conn.close()

            return jsonify({"message": "Serviço adicionado com sucesso", "id": servico_id}), 201
        except Exception as e:
            return jsonify({"message": f"Erro ao adicionar serviço: {e}"}), 500
    else:
        return jsonify({"message": "Erro ao conectar ao banco de dados"}), 500
