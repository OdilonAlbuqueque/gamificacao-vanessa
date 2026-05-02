# Controle de Gamificação – Vanessa Amorim
**Clínica de Estética Facial & Corporal**

Sistema SaaS completo de gamificação para colaboradores e clientes, conectado ao Supabase.

---

## 🚀 Como Configurar

### 1. Banco de Dados (Supabase)
1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. No painel, vá em **SQL Editor**
3. Cole e execute o conteúdo de `supabase-schema.sql`
4. Copie a **URL do Projeto** e a **Anon Key** (em Project Settings > API)

### 2. Abrir o Sistema
- Abra o arquivo `index.html` diretamente no navegador
- Cole a URL e a Anon Key do Supabase
- Clique em **Conectar ao Supabase**

---

## 📁 Estrutura de Arquivos
```
gamificacao-vanessa/
├── index.html              ← Página principal
├── supabase-schema.sql     ← Script SQL para o Supabase
├── css/
│   └── style.css           ← Design system completo
└── js/
    ├── supabase.js         ← Conexão e queries ao banco
    ├── utils.js            ← Utilitários, toast, print
    ├── app.js              ← Bootstrap e navegação
    └── pages/
        ├── dashboard.js    ← Dashboard com KPIs e ranking
        ├── clientes.js     ← Cadastro e ranking de clientes
        ├── pontos.js       ← Lançamento e resgate de pontos
        ├── colaboradores.js← Cadastro de colaboradores
        ├── metas.js        ← Metas coletivas e individuais
        ├── calendario.js   ← Calendário de aniversários
        ├── mensagens.js    ← Templates WhatsApp
        └── configuracoes.js← Regras, premiações, procedimentos
```

---

## 🎯 Funcionalidades

### Dashboard
- KPIs: clientes ativos, pontos em circulação, pontos expirando, aniversários
- Ranking com opção de ocultar (para apresentação a clientes)
- Últimas pontuações lançadas (5 mais recentes)
- Alertas de pontos expirando em 14 dias
- Próximos aniversariantes (14 dias)

### Clientes
- Cadastro completo: CPF, endereço, aniversário, Instagram, indicação
- Ranking com badges de posição (ouro/prata/bronze)
- Perfil individual com histórico detalhado de pontos
- **Impressão** de extrato limpo com logo
- Alerta automático quando cliente conquista uma premiação

### Lançar Pontos
- Lançamento rápido por regra pré-cadastrada ou manual
- Registro de resgate de premiações e procedimentos
- Log dos últimos lançamentos
- Expiração manual de pontos vencidos

### Colaboradores
- Cadastro com cargo, departamento, data de contratação

### Metas
- Metas coletivas e individuais com barra de progresso
- Atualização manual do progresso
- Recompensas configuráveis

### Calendário
- Visualização mensal com aniversários destacados
- Lista de aniversariantes do mês
- Botão de envio rápido via WhatsApp Web

### Mensagens (WhatsApp)
- Templates pré-configurados por categoria
- Tags dinâmicas: `{{nome_cliente}}`, `{{pontos}}`, etc.
- Envio via **WhatsApp Web** (abre no navegador)
- Pré-estruturado para API (Evolution API, WhatsApp Oficial)

### Configurações
- **Regras de Pontuação**: cadastre qualquer tipo de bonificação com os pontos correspondentes
- **Premiações**: prêmios e os pontos necessários para conquistá-los
- **Procedimentos**: catálogo de procedimentos estéticos, opcionalmente disponíveis para resgate
- **Usuários**: pré-estruturado para perfis de acesso (Admin, Gerente, Operador, Visualizador)
- **WhatsApp API**: configuração de provedores de envio

---

## ⭐ Regras de Pontuação Padrão

| Ação | Pontos |
|------|--------|
| Cliente indicou alguém | +50 pts |
| Indicação fechou procedimento | +100 pts |
| Post no Instagram com marcação | +50 pts |

*(Personalizáveis em Configurações > Pontuações)*

---

## ⏰ Validade dos Pontos
- Cada lote de pontos tem validade de **1 ano** a partir do lançamento
- Pontos expirados são descontados do saldo e registrados como "Expirado"
- Dashboard mostra clientes com pontos expirando nos próximos 14 dias

---

## 🔮 Roadmap Futuro
- [ ] Autenticação Supabase Auth com perfis de usuário
- [ ] Envio automático via Evolution API / WhatsApp Oficial
- [ ] Notificações push de aniversários
- [ ] Upload de logo da clínica para impressão
- [ ] Relatórios e exportação Excel/PDF
