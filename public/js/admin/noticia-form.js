// Formulário de Notícia — Criar, editar e preview

import { db } from '../firebase-config.js';
import { requerAutenticacao, fazerLogout } from './auth.js';
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// Elementos
const loadingEl = document.getElementById('auth-loading');
const conteudoEl = document.getElementById('admin-conteudo');
const usuarioEmail = document.getElementById('usuario-email');
const btnSair = document.getElementById('btn-sair');
const formTituloPagina = document.getElementById('form-titulo-pagina');

const form = document.getElementById('form-noticia');
const inputTitulo = document.getElementById('titulo');
const inputResumo = document.getElementById('resumo');
const inputConteudo = document.getElementById('conteudo');
const inputImagemUrl = document.getElementById('imagem_url');
const inputAtivo = document.getElementById('ativo');

const erroMsg = document.getElementById('erro-mensagem');
const sucessoMsg = document.getElementById('sucesso-mensagem');

const btnSalvar = document.getElementById('btn-salvar');
const btnPreview = document.getElementById('btn-preview');
const btnVoltarEdicao = document.getElementById('btn-voltar-edicao');
const btnSalvarPreview = document.getElementById('btn-salvar-do-preview');

const modoForm = document.getElementById('modo-form');
const modoPreview = document.getElementById('modo-preview');

// Ajuda da imagem
const btnAjudaImagem = document.getElementById('btn-ajuda-imagem');
const ajudaImagemBox = document.getElementById('ajuda-imagem-box');

// Contadores de caracteres
const contadorTitulo = document.getElementById('contador-titulo');
const contadorResumo = document.getElementById('contador-resumo');

// ID da notícia (presente se for edição)
let noticiaId = null;
let dataPublicacaoExistente = null;

async function init() {
  const user = await requerAutenticacao();
  usuarioEmail.textContent = user.email;

  // Identifica se é edição ou criação
  const params = new URLSearchParams(window.location.search);
  noticiaId = params.get('id');

  if (noticiaId) {
    formTituloPagina.textContent = 'Editar Notícia';
    document.title = 'Editar Notícia — Painel Administrativo';
    await carregarNoticia(noticiaId);
  }

  loadingEl.hidden = true;
  conteudoEl.hidden = false;

  // Contadores iniciais
  atualizarContador(inputTitulo, contadorTitulo);
  atualizarContador(inputResumo, contadorResumo);
}

async function carregarNoticia(id) {
  try {
    const snap = await getDoc(doc(db, 'noticias', id));
    if (!snap.exists()) {
      alert('Notícia não encontrada.');
      window.location.href = '/admin/noticias';
      return;
    }

    const data = snap.data();
    inputTitulo.value = data.titulo || '';
    inputResumo.value = data.resumo || '';
    inputConteudo.value = data.conteudo || '';
    inputImagemUrl.value = data.imagem_url || '';
    inputAtivo.checked = data.ativo !== false;
    dataPublicacaoExistente = data.data_publicacao || null;
  } catch (erro) {
    console.error('Erro ao carregar notícia:', erro);
    alert('Não foi possível carregar a notícia.');
    window.location.href = '/admin/noticias';
  }
}

// SUBMIT
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await salvar();
});

btnSalvarPreview.addEventListener('click', async () => {
  await salvar();
});

async function salvar() {
  esconderMensagens();

  const titulo = inputTitulo.value.trim();
  const resumo = inputResumo.value.trim();
  const conteudo = inputConteudo.value.trim();
  const imagemUrl = inputImagemUrl.value.trim();
  const ativo = inputAtivo.checked;

  if (!titulo || !resumo || !conteudo) {
    mostrarErro('Preencha todos os campos obrigatórios (título, resumo e conteúdo).');
    return;
  }

  if (imagemUrl && !ehUrlValida(imagemUrl)) {
    mostrarErro('A URL da imagem parece inválida. Verifique se começa com "https://".');
    return;
  }

  setSalvando(true);

  try {
    const dados = {
      titulo,
      resumo,
      conteudo,
      imagem_url: imagemUrl || null,
      ativo
    };

    if (noticiaId) {
      // Edição: preserva a data de publicação original
      await updateDoc(doc(db, 'noticias', noticiaId), dados);
      mostrarSucesso('Notícia atualizada com sucesso!');
    } else {
      // Criação: define data de publicação como agora
      dados.data_publicacao = serverTimestamp();
      const ref = await addDoc(collection(db, 'noticias'), dados);
      noticiaId = ref.id;
      formTituloPagina.textContent = 'Editar Notícia';
      // Atualiza URL sem recarregar a página
      const novaURL = `/admin/noticia-form?id=${noticiaId}`;
      window.history.replaceState({}, '', novaURL);
      mostrarSucesso('Notícia publicada com sucesso!');
    }

    // Se estava em modo preview, volta pro form
    if (!modoPreview.hidden) {
      voltarParaForm();
    }
  } catch (erro) {
    console.error('Erro ao salvar:', erro);
    mostrarErro('Não foi possível salvar. Verifique sua conexão e tente novamente.');
  } finally {
    setSalvando(false);
  }
}

// PREVIEW
btnPreview.addEventListener('click', () => {
  const titulo = inputTitulo.value.trim();
  const resumo = inputResumo.value.trim();
  const conteudo = inputConteudo.value.trim();

  if (!titulo || !resumo || !conteudo) {
    mostrarErro('Preencha título, resumo e conteúdo antes de visualizar.');
    return;
  }

  renderizarPreview();
  modoForm.hidden = true;
  modoPreview.hidden = false;
  window.scrollTo(0, 0);
});

btnVoltarEdicao.addEventListener('click', voltarParaForm);

function voltarParaForm() {
  modoPreview.hidden = true;
  modoForm.hidden = false;
  window.scrollTo(0, 0);
}

function renderizarPreview() {
  document.getElementById('preview-titulo').textContent = inputTitulo.value.trim();
  document.getElementById('preview-data').textContent = formatarDataAtual();

  const conteudoEl = document.getElementById('preview-conteudo');
  conteudoEl.innerHTML = formatarConteudo(inputConteudo.value.trim());

  const imagemUrl = inputImagemUrl.value.trim();
  const imagemContainer = document.getElementById('preview-imagem-container');
  const imagemEl = document.getElementById('preview-imagem');

  if (imagemUrl) {
    imagemEl.src = imagemUrl;
    imagemContainer.hidden = false;
  } else {
    imagemContainer.hidden = true;
  }
}

// HELPERS
function formatarConteudo(texto) {
  return escapeHTML(texto)
    .split('\n')
    .filter(l => l.trim())
    .map(l => `<p>${l}</p>`)
    .join('');
}

function formatarDataAtual() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function ehUrlValida(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function mostrarErro(msg) {
  erroMsg.textContent = msg;
  erroMsg.hidden = false;
  sucessoMsg.hidden = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarSucesso(msg) {
  sucessoMsg.textContent = msg;
  sucessoMsg.hidden = false;
  erroMsg.hidden = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function esconderMensagens() {
  erroMsg.hidden = true;
  sucessoMsg.hidden = true;
}

function setSalvando(carregando) {
  btnSalvar.disabled = carregando;
  btnSalvarPreview.disabled = carregando;
  btnSalvar.textContent = carregando ? '⏳ Salvando...' : '💾 Salvar';
  btnSalvarPreview.textContent = carregando ? '⏳ Salvando...' : '💾 Salvar';
}

function atualizarContador(input, contadorEl) {
  input.addEventListener('input', () => {
    contadorEl.textContent = input.value.length;
  });
  contadorEl.textContent = input.value.length;
}

// Ajuda da imagem
btnAjudaImagem.addEventListener('click', () => {
  ajudaImagemBox.hidden = !ajudaImagemBox.hidden;
});

btnSair.addEventListener('click', async () => {
  if (confirm('Deseja sair? Mudanças não salvas serão perdidas.')) {
    await fazerLogout();
  }
});

init();
