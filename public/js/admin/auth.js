// Módulo compartilhado de autenticação do painel admin
// Importado por todas as páginas /admin/*

import { auth } from '../firebase-config.js';
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

/**
 * Verifica se o usuário está autenticado.
 * Se NÃO estiver, redireciona para a tela de login.
 * Retorna uma Promise que resolve com o user quando autenticado.
 */
export function requerAutenticacao() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        window.location.href = '/admin/login';
      }
    });
  });
}

/**
 * Faz logout e redireciona para a tela de login.
 */
export async function fazerLogout() {
  try {
    await signOut(auth);
    window.location.href = '/admin/login';
  } catch (erro) {
    console.error('Erro ao fazer logout:', erro);
    alert('Não foi possível sair. Por favor, tente novamente.');
  }
}

/**
 * Converte códigos de erro do Firebase em mensagens em português.
 */
export function traduzirErroAuth(codigo) {
  const mensagens = {
    'auth/invalid-email': 'E-mail inválido. Verifique o formato.',
    'auth/user-disabled': 'Esta conta foi desativada.',
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    'auth/network-request-failed': 'Sem conexão com a internet.',
    'auth/missing-password': 'Digite sua senha.',
    'auth/missing-email': 'Digite seu e-mail.'
  };
  return mensagens[codigo] || 'Erro ao autenticar. Tente novamente.';
}
