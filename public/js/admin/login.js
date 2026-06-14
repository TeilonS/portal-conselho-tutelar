// Login — Submissão do formulário e autenticação

import { auth } from '../firebase-config.js';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { traduzirErroAuth } from './auth.js';

const form = document.getElementById('form-login');
const inputEmail = document.getElementById('email');
const inputSenha = document.getElementById('senha');
const erroMsg = document.getElementById('erro-mensagem');
const btnEntrar = document.getElementById('btn-entrar');

// Se já estiver logado, vai direto pro dashboard
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = '/admin/dashboard';
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  esconderErro();

  const email = inputEmail.value.trim();
  const senha = inputSenha.value;

  if (!email || !senha) {
    mostrarErro('Preencha e-mail e senha.');
    return;
  }

  setCarregando(true);

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    // Redirect feito pelo onAuthStateChanged acima
  } catch (erro) {
    console.error('Erro no login:', erro.code);
    mostrarErro(traduzirErroAuth(erro.code));
    setCarregando(false);
  }
});

function mostrarErro(mensagem) {
  erroMsg.textContent = mensagem;
  erroMsg.hidden = false;
}

function esconderErro() {
  erroMsg.hidden = true;
}

function setCarregando(carregando) {
  btnEntrar.disabled = carregando;
  btnEntrar.textContent = carregando ? '⏳ Entrando...' : '🔐 Entrar';
}
