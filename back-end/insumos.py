from flask import Flask, Blueprint, request, jsonify
from database import connect_db
from datetime import datetime

#app = Flask(__name__)
insumos_bp = Blueprint('insumos', __name__)


# Rota para adicionar um insumo

@insumos_bp.route('/add', methods=['POST'])
def add_insumo():
    data = request.json
    usuario_id = data.get('usuario_id')
    insumo = data.get('insumo')
    quantidade_total = data.get('quantidade_total')
    valor_unitario = data.get('valor_unitario')
    data_compra = data.get('data_compra')
    data_pagamento = data.get('data_pagamento')

    if not usuario_id or not insumo or not quantidade_total or not valor_unitario or not data_compra or not data_pagamento:
        return jsonify({"message": "Campos obrigatórios faltando"}), 400

    try:
        quantidade_total = float(quantidade_total)
        valor_unitario = float(valor_unitario)
        data_compra = datetime.strptime(data_compra, "%Y-%m-%d").date()
        data_pagamento = datetime.strptime(data_pagamento, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"message": "Dados inválidos. Verifique os formatos."}), 400

    conn = connect_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO insumos (usuario_id, insumo, quantidade_total, valor_unitario, data_compra, data_pagamento) 
                VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
                (usuario_id, insumo, quantidade_total,
                 valor_unitario, data_compra, data_pagamento)
            )
            insumo_id = cursor.fetchone()[0]
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"id": insumo_id, "message": "Insumo adicionado com sucesso"}), 201
        except Exception as e:
            return jsonify({"message": f"Erro ao adicionar insumo: {e}"}), 500
    else:
        return jsonify({"message": "Erro ao conectar ao banco de dados"}), 500

# Rota para buscar insumos

@insumos_bp.route('/', methods=['GET'])
def get_insumos():
    usuario_id = request.args.get('usuario_id')  # Obtém o usuário via query params

    if not usuario_id:
        return jsonify({"error": "Parâmetro 'usuario_id' é obrigatório"}), 400

    conn = connect_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, insumo, quantidade_total, valor_unitario, valor_total, data_compra, data_pagamento
                FROM insumos WHERE usuario_id = %s
            """, (usuario_id,))
            insumos = cursor.fetchall()
            cursor.close()
            conn.close()

            if not insumos:
                return jsonify([]), 200  # Retorna lista vazia se não há insumos

            insumos_list = [
                {
                    "id": i[0],
                    "insumo": i[1],
                    "quantidade_total": i[2],
                    "valor_unitario": i[3],
                    "valor_total": i[4],
                    "data_compra": i[5].strftime("%Y-%m-%d") if i[4] else None,
                    "data_pagamento": i[6].strftime("%Y-%m-%d") if i[5] else None,
                }
                for i in insumos
            ]

            return jsonify(insumos_list), 200
        except Exception as e:
            return jsonify({"error": f"Erro ao buscar insumos: {str(e)}"}), 500
    else:
        return jsonify({"message": "Erro ao conectar ao banco de dados"}), 500


# Rota para deletar insumos


@insumos_bp.route('/<int:id>', methods=['DELETE'])
def delete_insumo(id):
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM insumos WHERE id = %s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Insumo deletado com sucesso."}), 200
    except Exception as e:
        print(f"Erro ao buscar insumos: {e}")
        return jsonify({"error": str(e)}), 500






#app.register_blueprint(insumos_bp, url_prefix='/insumos')

if __name__ == '__main__':
    app.run(debug=True)
