from flask import Blueprint, request, jsonify
from database import connect_db

# Blueprint para serviços
servicos_bp = Blueprint('servicos', __name__)

# Rota para adicionar um serviço
@servicos_bp.route('/add', methods=['POST'])
def add_servico():
    data = request.json
    descricao = data.get('descricao')
    valor_total = data.get('valor_total')
    
    # Verificar se os campos obrigatórios estão preenchidos
    if not descricao or not valor_total:
        return jsonify({"message": "Campos obrigatórios faltando"}), 400

    conn = connect_db()
    if conn:
        try:
            cursor = conn.cursor()
            # Inserir dados na tabela de serviços
            cursor.execute("""
                INSERT INTO servicos (descricao, valor_total)
                VALUES (%s, %s)
                RETURNING id
            """, (descricao, valor_total))
            
            # Pegar o ID gerado automaticamente
            servico_id = cursor.fetchone()[0]
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return jsonify({
                "message": "Serviço adicionado com sucesso",
                "id": servico_id
            }), 201
        except Exception as e:
            return jsonify({"message": f"Erro ao adicionar serviço: {e}"}), 500
    else:
        return jsonify({"message": "Erro ao conectar ao banco de dados"}), 500
