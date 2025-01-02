from flask import Blueprint, request, jsonify
from database import connect_db
from datetime import datetime

insumos_bp = Blueprint('insumos', __name__)

# Rota para adicionar um insumo
@insumos_bp.route('/add', methods=['POST'])
def add_insumo():
    data = request.json
    nome_insumo = data.get('nome_insumo')
    quantidade_total = data.get('quantidade_total')
    valor_unitario = data.get('valor_unitario')
    data_compra = data.get('data_compra')
    data_pagamento = data.get('data_pagamento')

    # Validar se todos os campos obrigatórios foram preenchidos
    if not nome_insumo or not quantidade_total or not valor_unitario or not data_compra or not data_pagamento:
        return jsonify({"message": "Campos obrigatórios faltando"}), 400

    # Calcular o valor total automaticamente
    try:
        quantidade_total = float(quantidade_total)
        valor_unitario = float(valor_unitario)
        valor_total = quantidade_total * valor_unitario
    except ValueError:
        return jsonify({"message": "Quantidade total e valor unitário devem ser números válidos"}), 400

    # Converter as datas para o formato correto
    try:
        data_compra = datetime.strptime(data_compra, "%Y-%m-%d").date()
        data_pagamento = datetime.strptime(data_pagamento, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"message": "Formato de data inválido. Use o formato AAAA-MM-DD"}), 400

    # Conectar ao banco de dados
    conn = connect_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO insumos (nome_insumo, quantidade_total, valor_unitario, valor_total, data_compra, data_pagamento)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (nome_insumo, quantidade_total, valor_unitario, valor_total, data_compra, data_pagamento))

            # Pegar o ID gerado automaticamente
            insumos_id = cursor.fetchone()[0]
           
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"message": "Insumo adicionado com sucesso", "id": insumos_id}), 201
        except Exception as e:
            return jsonify({"message": f"Erro ao adicionar insumo: {e}"}), 500
    else:
        return jsonify({"message": "Erro ao conectar ao banco de dados"}), 500
