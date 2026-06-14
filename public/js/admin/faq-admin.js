// FAQ Admin — Lista de perguntas

import { db } from '../firebase-config.js';
import { requerAutenticacao, fazerLogout } from './auth.js';
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const loadingEl = document.getElementById('auth-loading');
const conteudoEl = document.getElementById('admin-conteudo');
const usuarioEmail = document.getElementById('usuario-email');
const btnSair = document.getElementById('btn-sair');
const listaEl = document.getElementById('lista-faq');

async function init() {
  const user = await requerAutenticacao();
  usuarioEmail.textContent = user.email;
  loadingEl.hidden = true;
  conteudoEl.hidden = false;

  await carregarFAQ();
}

async function carregarFAQ() {
  try {
    const faqRef = collection(db, 'faq');
    // No admin mostramos TODAS (ativas e inativas), ordenadas por ordem
    const q = query(faqRef, orderBy('ordem', 'asc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      renderizarVazio();
      return;
    }

    const itens = [];
    snapshot.forEach((doc) => {
      itens.push({ id: doc.id, ...doc.data() });
    });

    renderizarLista(itens);
  } catch (erro) {
    console.error('Erro ao carregar FAQ:', erro);
    renderizarErro();
  }
}

function renderizarLista(itens) {
  listaEl.innerHTML = itens.map((item) => {
    const statusClass = item.ativo ? 'badge-ativo' : 'badge-inativo';
    const statusTxt = item.ativo ? 'ATIVA' : 'INATIVA';
    const btnToggleTxt = item.ativo ? 'Desativar' : 'Ativar';

    return `
      <div class="item-admin">
        <div class="item-admin-conteudo">
          <div class="item-admin-meta">
            <span class="badge ${statusClass}">${statusTxt}</span>
            <span class="item-admin-data">Ordem: ${item.ordem ?? '—'}</span>
          </div>
          <h3 class="item-admin-titulo">${escapeHTML(item.pergunta)}</h3>
          <p class="item-admin-resumo">${escapeHTML(truncar(item.resposta, 180))}</p>
        </div>
        <div class="item-admin-acoes">
          <a href="/admin/faq-form?id=${escapeAttr(item.id)}" class="btn-acao btn-editar">
            ✏️ Editar
          </a>
          <button class="btn-acao btn-toggle" data-id="${escapeAttr(item.id)}" data-ativo="${item.ativo}">
            ${item.ativo ? '🚫' : '✓'} ${btnToggleTxt}
          </button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', () => alternarStatus(btn));
  });
}

async function alternarStatus(btn) {
  const id = btn.dataset.id;
  const ativoAtual = btn.dataset.ativo === 'true';
  const novoStatus = !ativoAtual;

  const acao = novoStatus ? 'reativar' : 'desativar';
  if (!confirm(`Deseja ${acao} esta pergunta?`)) return;

  btn.disabled = true;
  btn.textContent = '⏳ Aguarde...';

  try {
    await updateDoc(doc(db, 'faq', id), { ativo: novoStatus });
    await carregarFAQ();
  } catch (erro) {
    console.error('Erro ao atualizar:', erro);
    alert('Não foi possível atualizar. Verifique sua conexão e tente novamente.');
    btn.disabled = false;
  }
}

function renderizarVazio() {
  listaEl.innerHTML = `
    <div class="faq-empty">
      <div class="faq-empty-icone" aria-hidden="true">💬</div>
      <h3>Nenhuma pergunta cadastrada</h3>
      <p>Clique em "Nova Pergunta" para criar a primeira.</p>
    </div>
  `;
}

function renderizarErro() {
  listaEl.innerHTML = `
    <div class="faq-empty">
      <div class="faq-empty-icone" aria-hidden="true">⚠️</div>
      <h3>Erro ao carregar perguntas</h3>
      <p>Por favor, recarregue a página.</p>
    </div>
  `;
}

function truncar(texto, max) {
  if (!texto) return '';
  return texto.length <= max ? texto : texto.slice(0, max).trim() + '…';
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

btnSair.addEventListener('click', async () => {
  if (confirm('Deseja sair?')) await fazerLogout();
});

init();
