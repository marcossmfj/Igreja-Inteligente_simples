# Igreja Inteligente ⛪

Sistema web SaaS multi-tenant para automação de processos administrativos de igrejas (Gestão de Membros, Visitantes e Escalas Inteligentes).

## 🚀 Tecnologias
- **Frontend:** Next.js 15+, Tailwind CSS, shadcn/ui.
- **Backend/Banco:** Supabase (Auth, PostgreSQL, Row Level Security).
- **Estilização:** Tailwind CSS.

## ⚙️ Configuração do Banco de Dados (Supabase)

1. Crie um projeto no [Supabase](https://supabase.com/).
2. Vá em **SQL Editor** e execute o conteúdo do arquivo `supabase_schema.sql` deste repositório. Isso criará:
   - Tabelas (`churches`, `profiles`, `members`, etc).
   - Políticas de RLS (garantindo que uma igreja não veja dados da outra).
   - Triggers para criação automática de perfil de usuário.

## 💻 Como rodar localmente

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Copie o arquivo `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Preencha as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com as chaves do seu projeto no Supabase (**Project Settings > API**).
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
6. Acesse `http://localhost:3000`.

## 📦 Deploy na Vercel

1. Conecte seu repositório GitHub à [Vercel](https://vercel.com/).
2. Configure as **Environment Variables** no painel da Vercel com os mesmos nomes do arquivo `.env.local`.
3. Clique em **Deploy**.

## 🧠 Lógicas Implementadas
- **Multi-tenancy:** Todo dado é filtrado pelo `church_id` do usuário logado.
- **Escala Inteligente:** Ao criar uma escala para uma função (ex: Guitarrista), o sistema filtra automaticamente apenas os membros que possuem essa habilidade.
- **WhatsApp Direct:** Geração de links automáticos para envio de mensagens de boas-vindas para visitantes.

## 🛡️ Segurança
O sistema utiliza **Row Level Security (RLS)** do PostgreSQL via Supabase. Mesmo que alguém tente acessar dados via API diretamente, as políticas garantem que ele só possa ver dados vinculados ao seu próprio `church_id`.
