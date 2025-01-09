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
    data_servico = data.get('data_servico')
    data_pagamento = data.get('data_pagamento')

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
                INSERT INTO servicos (usuario_id, descricao, valor_total, data_servico, data_pagamento)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (usuario_id, descricao, valor_total, data_servico, data_pagamento))

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

# Rota para buscar todos os serviços
@servicos_bp.route('/', methods=['GET'])
def get_servicos():
    usuario_id = request.args.get('usuario_id')

    if not usuario_id:
        return jsonify({"message": "Usuário não especificado"}), 400

    conn = connect_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, descricao, valor_total, data_servico, data_pagamento
                FROM servicos
                WHERE usuario_id = %s
            """, (usuario_id,))
            servicos = cursor.fetchall()
            cursor.close()
            conn.close()

            servicos_list = [
                {
                    "id": servico[0],
                    "descricao": servico[1],
                    "valor_total": servico[2],
                    "data_servico": servico[3],
                    "data_pagamento": servico[4],
                }
                for servico in servicos
            ]

            return jsonify(servicos_list), 200
        except Exception as e:
            return jsonify({"message": f"Erro ao buscar serviços: {e}"}), 500
    else:
        return jsonify({"message": "Erro ao conectar ao banco de dados"}), 500

# Rota para excluir um serviço
#@servicos_bp.route('/delete/<int:servico_id>', methods=['DELETE'])
@servicos_bp.route('/<int:servico_id>', methods=['DELETE'])
def delete_servico(servico_id):
    conn = connect_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                DELETE FROM servicos
                WHERE id = %s
            """, (servico_id,))
            conn.commit()
            cursor.close()
            conn.close()

            return jsonify({"message": "Serviço excluído com sucesso"}), 200
        except Exception as e:
            return jsonify({"message": f"Erro ao excluir serviço: {e}"}), 500
    else:
        return jsonify({"message": "Erro ao conectar ao banco de dados"}), 500
