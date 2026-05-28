# Portal Conselhos Tutelares — Vitória da Conquista

Portal digital educativo sobre proteção da criança e do adolescente, desenvolvido como projeto de extensão universitária em parceria com a Rede de Atenção e Defesa dos Direitos da Criança e do Adolescente de Vitória da Conquista — BA.

## Sobre o projeto

O portal tem como objetivo facilitar o acesso da comunidade às informações sobre os tipos de violência contra crianças e adolescentes, bem como aos canais oficiais de denúncia disponíveis no município.

**Vinculado ao ODS 16** — Paz, Justiça e Instituições Eficazes.

## Funcionalidades

- Página educativa sobre os 5 tipos de violência (física, psicológica, sexual, negligência e trabalho infantil)
- Canais oficiais de denúncia centralizados (Disque 100, Conselhos Tutelares por zona, Polícia Civil, SaferNet)
- Materiais educativos
- Notícias e campanhas (Maio Laranja, 18 de Maio)
- Interface mobile-first acessível
- Painel administrativo para gestão de conteúdo

## Stack

- HTML5 + CSS3 + JavaScript (Vanilla)
- Firebase (Hosting, Firestore, Authentication)
- Design mobile-first com tokens CSS

## Estrutura

\`\`\`
portal-conselho-tutelar/
├── public/              # Arquivos servidos publicamente
│   ├── css/             # Folhas de estilo
│   ├── js/              # Scripts
│   ├── admin/           # Painel administrativo
│   └── *.html           # Páginas
├── firebase.json        # Configuração do hosting
├── firestore.rules      # Regras de segurança
└── firestore.indexes.json
\`\`\`

## Desenvolvimento

\`\`\`bash
# Servir localmente
firebase serve --only hosting

# Deploy em produção
firebase deploy --only hosting
\`\`\`

## Autor

Teilon Santos — Análise e Desenvolvimento de Sistemas, Uniasselvi  
[GitHub](https://github.com/TeilonS) · [LinkedIn](https://linkedin.com/in/teilon-santos)
