const API = 'http://localhost:5000/tarefas';

const form = document.getElementById('form-tarefa');
const inputTitulo = document.getElementById('input-titulo');
const inputDescricao = document.getElementById('input-descricao');
const btnSalvar = document.getElementById('btn-salvar');
const btnCancelar = document.getElementById('btn-cancelar');
const listaTarefas = document.getElementById('lista-tarefas');

let editandoId = null;

// ── Carregar tarefas ao abrir a página ──────────────────────────────
document.addEventListener('DOMContentLoaded', carregarTarefas);

async function carregarTarefas() {
    const res = await fetch(API);
    const tarefas = await res.json();
    listaTarefas.innerHTML = '';
    tarefas.forEach(renderizarTarefa);
}

// ── Renderizar uma tarefa na lista ──────────────────────────────────
function renderizarTarefa(tarefa) {
    const li = document.createElement('li');
    li.className = 'tarefa-item' + (tarefa.concluida ? ' concluida' : '');
    li.dataset.id = tarefa.id;

    li.innerHTML = `
        <input type="checkbox" class="tarefa-check" ${tarefa.concluida ? 'checked' : ''}>
        <div class="tarefa-info">
            <h3>${escaparHTML(tarefa.titulo)}</h3>
            <p>${escaparHTML(tarefa.descricao || '')}</p>
        </div>
        <div class="tarefa-acoes">
            <button class="btn-editar">Editar</button>
            <button class="btn-excluir">Excluir</button>
        </div>
    `;

    // Concluir / Desconcluir
    li.querySelector('.tarefa-check').addEventListener('change', () => concluirTarefa(tarefa.id));

    // Editar
    li.querySelector('.btn-editar').addEventListener('click', () => {
        editandoId = tarefa.id;
        inputTitulo.value = tarefa.titulo;
        inputDescricao.value = tarefa.descricao || '';
        btnSalvar.textContent = 'Salvar';
        btnCancelar.classList.remove('hidden');
        inputTitulo.focus();
    });

    // Excluir
    li.querySelector('.btn-excluir').addEventListener('click', () => excluirTarefa(tarefa.id));

    listaTarefas.appendChild(li);
}

// ── Criar ou Editar tarefa (submit do form) ─────────────────────────
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = inputTitulo.value.trim();
    const descricao = inputDescricao.value.trim();

    if (!titulo) return;

    if (editandoId) {
        await fetch(`${API}/${editandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, descricao })
        });
    } else {
        await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, descricao })
        });
    }

    cancelarEdicao();
    carregarTarefas();
});

// ── Concluir / Desconcluir ──────────────────────────────────────────
async function concluirTarefa(id) {
    await fetch(`${API}/${id}/concluir`, { method: 'PATCH' });
    carregarTarefas();
}

// ── Excluir ─────────────────────────────────────────────────────────
async function excluirTarefa(id) {
    if (!confirm('Deseja excluir esta tarefa?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    carregarTarefas();
}

// ── Cancelar edição ─────────────────────────────────────────────────
btnCancelar.addEventListener('click', cancelarEdicao);

function cancelarEdicao() {
    editandoId = null;
    inputTitulo.value = '';
    inputDescricao.value = '';
    btnSalvar.textContent = 'Adicionar';
    btnCancelar.classList.add('hidden');
}

// ── Utilitário: escapar HTML para evitar XSS ────────────────────────
function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}
