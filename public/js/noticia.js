// Notícia — Página de detalhe individual

import { db } from './firebase-config.js';
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const container = document.getElementById('noticia-container');

async function carregarNoticia() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    renderizarErro('Notícia não encontrada', 'O endereço acessado não contém um identificador válido.');
    return;
  }

  try {
    const docRef = doc(db, 'noticias', id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      renderizarErro('Notícia não encontrada', 'Esta notícia pode ter sido removida ou nunca existiu.');
      return;
    }

    const noticia = snapshot.data();

    if (!noticia.ativo) {
      renderizarErro('Notícia indisponível', 'Esta notícia não está mais disponível para visualização.');
      return;
    }

    renderizarNoticia(noticia);
    document.title = `${noticia.titulo} — Conselhos Tutelares VCA`;
  } catch (erro) {
    console.error('Erro ao carregar notícia:', erro);
    renderizarErro('Erro ao carregar', 'Por favor, tente novamente em alguns instantes.');
  }
}

function renderizarNoticia(noticia) {
  const dataFormatada = formatarData(noticia.data_publicacao);
  const imagem = noticia.imagem_url
    ? `<div class="noticia-detalhe-imagem"><img src="${escapeAttr(noticia.imagem_url)}" alt=""></div>`
    : '';

  container.innerHTML = `
    <header class="noticia-detalhe-header">
      <a href="/noticias" class="voltar-detalhe">← Voltar às notícias</a>
      <span class="noticia-data">${dataFormatada}</span>
      <h1>${escapeHTML(noticia.titulo)}</h1>
    </header>

    ${imagem}

    <div class="noticia-detalhe-conteudo">
      ${formatarConteudo(noticia.conteudo)}
    </div>
  `;
}

function renderizarErro(titulo, mensagem) {
  container.innerHTML = `
    <div class="faq-empty" style="margin: 40px 24px;">
      <div class="faq-empty-icone" aria-hidden="true">⚠️</div>
      <h3>${escapeHTML(titulo)}</h3>
      <p>${escapeHTML(mensagem)}</p>
      <div style="margin-top: 20px;">
        <a href="/noticias" class="btn btn-secundario" style="display: inline-flex; width: auto; padding: 12px 24px;">Voltar às notícias</a>
      </div>
    </div>
  `;
}

function formatarConteudo(texto) {
  return escapeHTML(texto)
    .split('\n')
    .filter(linha => linha.trim())
    .map(linha => `<p>${linha}</p>`)
    .join('');
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

carregarNoticia();
