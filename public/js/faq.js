// FAQ — Carrega perguntas do Firestore e renderiza accordion

import { db } from './firebase-config.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const container = document.getElementById('faq-container');

async function carregarFAQ() {
  try {
    const faqRef = collection(db, 'faq');
    const q = query(
      faqRef,
      where('ativo', '==', true),
      orderBy('ordem', 'asc')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      renderizarVazio();
      return;
    }

    const itens = [];
    snapshot.forEach((doc) => {
      itens.push({ id: doc.id, ...doc.data() });
    });

    renderizarFAQ(itens);
  } catch (erro) {
    console.error('Erro ao carregar FAQ:', erro);
    renderizarErro();
  }
}

function renderizarFAQ(itens) {
  container.innerHTML = itens.map((item, index) => `
    <details class="faq-item" ${index === 0 ? 'open' : ''}>
      <summary class="faq-pergunta">
        <span class="faq-texto">${escapeHTML(item.pergunta)}</span>
        <span class="faq-icone" aria-hidden="true">+</span>
      </summary>
      <div class="faq-resposta">
        ${formatarResposta(item.resposta)}
      </div>
    </details>
  `).join('');
}

function renderizarVazio() {
  container.innerHTML = `
    <div class="faq-empty">
      <div class="faq-empty-icone" aria-hidden="true">💬</div>
      <h3>Nenhuma pergunta cadastrada ainda</h3>
      <p>As perguntas frequentes serão publicadas em breve.</p>
    </div>
  `;
}

function renderizarErro() {
  container.innerHTML = `
    <div class="faq-empty">
      <div class="faq-empty-icone" aria-hidden="true">⚠️</div>
      <h3>Não foi possível carregar as perguntas</h3>
      <p>Por favor, tente novamente em alguns instantes.</p>
    </div>
  `;
}

// Permite quebras de linha no texto da resposta
function formatarResposta(texto) {
  return escapeHTML(texto)
    .split('\n')
    .filter(linha => linha.trim())
    .map(linha => `<p>${linha}</p>`)
    .join('');
}

// Sanitiza HTML para prevenir XSS
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

carregarFAQ();
