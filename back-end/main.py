from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_connection, init_db

app = Flask(__name__)
CORS(app)


# ── RF02 — Listar tarefas ───────────────────────────────────────────
@app.route('/tarefas', methods=['GET'])
def listar_tarefas():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM tarefa ORDER BY criado_em DESC")
    tarefas = cursor.fetchall()
    conn.close()
    return jsonify(tarefas)


# ── RF01 — Criar tarefa ─────────────────────────────────────────────
@app.route('/tarefas', methods=['POST'])
def criar_tarefa():
    dados = request.get_json()
    titulo = dados.get('titulo')
    descricao = dados.get('descricao', '')

    if not titulo:
        return jsonify({'erro': 'O título é obrigatório.'}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO tarefa (titulo, descricao) VALUES (%s, %s)",
        (titulo, descricao)
    )
    conn.commit()
    novo_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': novo_id, 'mensagem': 'Tarefa criada.'}), 201


# ── RF03 — Editar tarefa ────────────────────────────────────────────
@app.route('/tarefas/<int:tarefa_id>', methods=['PUT'])
def editar_tarefa(tarefa_id):
    dados = request.get_json()
    titulo = dados.get('titulo')
    descricao = dados.get('descricao', '')

    if not titulo:
        return jsonify({'erro': 'O título é obrigatório.'}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE tarefa SET titulo = %s, descricao = %s WHERE id = %s",
        (titulo, descricao, tarefa_id)
    )
    conn.commit()
    linhas = cursor.rowcount
    conn.close()

    if linhas == 0:
        return jsonify({'erro': 'Tarefa não encontrada.'}), 404
    return jsonify({'mensagem': 'Tarefa atualizada.'})


# ── RF04 — Concluir / Desconcluir tarefa ─────────────────────────────
@app.route('/tarefas/<int:tarefa_id>/concluir', methods=['PATCH'])
def concluir_tarefa(tarefa_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT concluida FROM tarefa WHERE id = %s", (tarefa_id,))
    tarefa = cursor.fetchone()

    if not tarefa:
        conn.close()
        return jsonify({'erro': 'Tarefa não encontrada.'}), 404

    novo_status = not tarefa['concluida']
    cursor.execute(
        "UPDATE tarefa SET concluida = %s WHERE id = %s",
        (novo_status, tarefa_id)
    )
    conn.commit()
    conn.close()
    return jsonify({'mensagem': 'Status atualizado.', 'concluida': novo_status})


# ── RF05 — Excluir tarefa ───────────────────────────────────────────
@app.route('/tarefas/<int:tarefa_id>', methods=['DELETE'])
def excluir_tarefa(tarefa_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tarefa WHERE id = %s", (tarefa_id,))
    conn.commit()
    linhas = cursor.rowcount
    conn.close()

    if linhas == 0:
        return jsonify({'erro': 'Tarefa não encontrada.'}), 404
    return jsonify({'mensagem': 'Tarefa excluída.'})


if __name__ == '__main__':
    init_db()
    app.run(debug=True)