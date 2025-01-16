from flask import Blueprint, request, jsonify
from database import connect_db
from sqlalchemy import func
from database import connect_db, Insumo, Servico, Receita 


# Blueprint para receitas
receitas_bp = Blueprint('receitas', __name__)

# Endpoint para obter os dados do gráfico
@receitas_bp.route('/dados-receita', methods=['GET'])
def obter_dados_receita():
    try:
        # Certifique-se de que o header correto está sendo usado
        usuario_id = request.headers.get('X-Usuario-ID')
        if not usuario_id:
            return jsonify({"erro": "usuario_id não fornecido"}), 400

        # Conexão com o banco de dados
        conn = connect_db()
        if not conn:
            return jsonify({"erro": "Erro ao conectar ao banco de dados"}), 500

        cursor = conn.cursor()

        # Receita bruta: soma dos valores de entrada das receitas para o usuário
        cursor.execute(
            "SELECT COALESCE(SUM(valor_entrada), 0) FROM receitas WHERE usuario_id = %s",
            (usuario_id,)
        )
        receita_bruta = cursor.fetchone()[0]

        # Total de insumos: soma de quantidade * valor_unitario para o usuário
        cursor.execute(
            "SELECT COALESCE(SUM(quantidade_total * valor_unitario), 0) FROM insumos WHERE usuario_id = %s",
            (usuario_id,)
        )
        total_insumos = cursor.fetchone()[0]

        # Total de serviços: soma dos valores totais dos serviços para o usuário
        cursor.execute(
            "SELECT COALESCE(SUM(valor_total), 0) FROM servicos WHERE usuario_id = %s",
            (usuario_id,)
        )
        total_servicos = cursor.fetchone()[0]

        # Receita líquida: receita bruta - (total de insumos + total de serviços)
        receita_liquida = receita_bruta - (total_insumos + total_servicos)

        # Retorna os dados no formato JSON
        dados = {
            "receita_bruta": float(receita_bruta),
            "total_insumos": float(total_insumos),
            "total_servicos": float(total_servicos),
            "receita_liquida": float(receita_liquida),
        }
        cursor.close()
        conn.close()
        return jsonify(dados), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500

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

    try:
        valor_entrada = float(valor_entrada)
    except ValueError:
        return jsonify({"message": "Valor de entrada deve ser um número válido"}), 400

    conn = connect_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO receitas (usuario_id, descricao, valor_entrada)
                VALUES (%s, %s, %s)
                RETURNING id
            """, (usuario_id, descricao, valor_entrada))

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
@receitas_bp.route('/<int:usuario_id>', methods=['GET'])
def list_receitas(usuario_id):

    if not usuario_id:
        return jsonify({"message": "Parâmetro 'usuario_id' é obrigatório"}), 400

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
            cursor.close()
            conn.close()

            if not receitas:
                return jsonify([]), 200

            receitas_list = [
                {
                    "id": receita[0],
                    "descricao": receita[1],
                    "valor_entrada": receita[2],
                }
                for receita in receitas
            ]

            return jsonify(receitas_list), 200
        except Exception as e:
            return jsonify({"message": f"Erro ao buscar receitas: {e}"}), 500
    else:
        return jsonify({"message": "Erro ao conectar ao banco de dados"}), 500

# Rota para excluir uma receita
@receitas_bp.route('/<int:receita_id>', methods=['DELETE'])
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
