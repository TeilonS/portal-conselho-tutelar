// Dashboard — Verifica autenticação e popula nome do usuário

import { requerAutenticacao, fazerLogout } from './auth.js';

const loadingEl = document.getElementById('auth-loading');
const conteudoEl = document.getElementById('admin-conteudo');
const usuarioEmail = document.getElementById('usuario-email');
const btnSair = document.getElementById('btn-sair');

// Verifica autenticação na carga da página
async function init() {
  const user = await requerAutenticacao();

  // Usuário autenticado, mostra o painel
  usuarioEmail.textContent = user.email;
  loadingEl.hidden = true;
  conteudoEl.hidden = false;
}

btnSair.addEventListener('click', async () => {
  const confirmou = confirm('Tem certeza que deseja sair?');
  if (confirmou) {
    await fazerLogout();
  }
});

init();
