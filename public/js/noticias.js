// Notícias — Lista as notícias do Firestore

import { db } from './firebase-config.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const container = document.getElementById('noticias-container');

async function carregarNoticias() {
  try {
    const noticiasRef = collection(db, 'noticias');
    const q = query(
      noticiasRef,
      where('ativo', '==', true),
      orderBy('data_publicacao', 'desc')
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

    renderizarNoticias(itens);
  } catch (erro) {
    console.error('Erro ao carregar notícias:', erro);
    renderizarErro();
  }
}

function renderizarNoticias(itens) {
  container.innerHTML = itens.map((item) => {
    const dataFormatada = formatarData(item.data_publicacao);
    const imagem = item.imagem_url
      ? `<div class="noticia-imagem"><img src="${escapeAttr(item.imagem_url)}" alt="" loading="lazy"></div>`
      : '';

    return `
      <a href="/noticia?id=${escapeAttr(item.id)}" class="noticia-card">
        ${imagem}
        <div class="noticia-conteudo">
          <span class="noticia-data">${dataFormatada}</span>
          <h2 class="noticia-titulo">${escapeHTML(item.titulo)}</h2>
          <p class="noticia-resumo">${escapeHTML(item.resumo)}</p>
          <span class="noticia-link">Ler mais →</span>
        </div>
      </a>
    `;
  }).join('');
}

function renderizarVazio() {
  container.innerHTML = `
    <div class="faq-empty">
      <div class="faq-empty-icone" aria-hidden="true">📰</div>
      <h3>Nenhuma notícia publicada ainda</h3>
      <p>As notícias e campanhas serão publicadas em breve.</p>
    </div>
  `;
}

function renderizarErro() {
  container.innerHTML = `
    <div class="faq-empty">
      <div class="faq-empty-icone" aria-hidden="true">⚠️</div>
      <h3>Não foi possível carregar as notícias</h3>
      <p>Por favor, tente novamente em alguns instantes.</p>
    </div>
  `;
}

function formatarData(timestamp) {
  if (!timestamp || !timestamp.toDate) return '';
  const data = timestamp.toDate();
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

carregarNoticias();
