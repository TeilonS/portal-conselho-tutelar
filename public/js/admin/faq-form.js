// FAQ Form — Criar e editar perguntas

import { db } from '../firebase-config.js';
import { requerAutenticacao, fazerLogout } from './auth.js';
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const loadingEl = document.getElementById('auth-loading');
const conteudoEl = document.getElementById('admin-conteudo');
const usuarioEmail = document.getElementById('usuario-email');
const btnSair = document.getElementById('btn-sair');
const formTituloPagina = document.getElementById('form-titulo-pagina');

const form = document.getElementById('form-faq');
const inputPergunta = document.getElementById('pergunta');
const inputResposta = document.getElementById('resposta');
const inputOrdem = document.getElementById('ordem');
const inputAtivo = document.getElementById('ativo');

const erroMsg = document.getElementById('erro-mensagem');
const sucessoMsg = document.getElementById('sucesso-mensagem');
const btnSalvar = document.getElementById('btn-salvar');

const contadorPergunta = document.getElementById('contador-pergunta');

let faqId = null;

async function init() {
  const user = await requerAutenticacao();
  usuarioEmail.textContent = user.email;

  const params = new URLSearchParams(window.location.search);
  faqId = params.get('id');

  if (faqId) {
    formTituloPagina.textContent = 'Editar Pergunta';
    document.title = 'Editar Pergunta — Painel Administrativo';
    await carregarFAQ(faqId);
  } else {
    // Sugere a próxima ordem disponível
    await sugerirProximaOrdem();
  }

  loadingEl.hidden = true;
  conteudoEl.hidden = false;

  atualizarContador(inputPergunta, contadorPergunta);
}

async function carregarFAQ(id) {
  try {
    const snap = await getDoc(doc(db, 'faq', id));
    if (!snap.exists()) {
      alert('Pergunta não encontrada.');
      window.location.href = '/admin/faq';
      return;
    }

    const data = snap.data();
    inputPergunta.value = data.pergunta || '';
    inputResposta.value = data.resposta || '';
    inputOrdem.value = data.ordem ?? '';
    inputAtivo.checked = data.ativo !== false;
  } catch (erro) {
    console.error('Erro ao carregar pergunta:', erro);
    alert('Não foi possível carregar a pergunta.');
    window.location.href = '/admin/faq';
  }
}

async function sugerirProximaOrdem() {
  try {
    const q = query(collection(db, 'faq'), orderBy('ordem', 'desc'), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
      inputOrdem.value = 1;
    } else {
      const ultimaOrdem = snap.docs[0].data().ordem || 0;
      inputOrdem.value = ultimaOrdem + 1;
    }
  } catch (erro) {
    console.error('Erro ao sugerir ordem:', erro);
    inputOrdem.value = 1;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await salvar();
});

async function salvar() {
  esconderMensagens();

  const pergunta = inputPergunta.value.trim();
  const resposta = inputResposta.value.trim();
  const ordem = parseInt(inputOrdem.value, 10);
  const ativo = inputAtivo.checked;

  if (!pergunta || !resposta) {
    mostrarErro('Preencha pergunta e resposta.');
    return;
  }

  if (isNaN(ordem) || ordem < 1) {
    mostrarErro('Informe uma ordem válida (número maior que zero).');
    return;
  }

  setSalvando(true);

  try {
    const dados = { pergunta, resposta, ordem, ativo };

    if (faqId) {
      await updateDoc(doc(db, 'faq', faqId), dados);
      mostrarSucesso('Pergunta atualizada com sucesso!');
    } else {
      const ref = await addDoc(collection(db, 'faq'), dados);
      faqId = ref.id;
      formTituloPagina.textContent = 'Editar Pergunta';
      window.history.replaceState({}, '', `/admin/faq-form?id=${faqId}`);
      mostrarSucesso('Pergunta criada com sucesso!');
    }
  } catch (erro) {
    console.error('Erro ao salvar:', erro);
    mostrarErro('Não foi possível salvar. Verifique sua conexão e tente novamente.');
  } finally {
    setSalvando(false);
  }
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
  btnSalvar.textContent = carregando ? '⏳ Salvando...' : '💾 Salvar';
}

function atualizarContador(input, contadorEl) {
  input.addEventListener('input', () => {
    contadorEl.textContent = input.value.length;
  });
  contadorEl.textContent = input.value.length;
}

btnSair.addEventListener('click', async () => {
  if (confirm('Deseja sair? Mudanças não salvas serão perdidas.')) {
    await fazerLogout();
  }
});

init();
