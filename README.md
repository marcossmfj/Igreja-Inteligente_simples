# Igreja Inteligente Simples

MVP de gestão eclesiástica com foco em simplicidade, velocidade e design premium.

## 🚀 Tecnologias
- **Framework:** Next.js 15 (App Router)
- **Estilização:** Tailwind CSS + Shadcn UI
- **Banco de Dados & Auth:** Supabase
- **Ícones:** Lucide React

## 🛠️ Configuração do Supabase

### 1. Criar Tabelas
Execute o script `supabase_schema.sql` no SQL Editor do Supabase para criar a estrutura necessária:
- `churches`: Gestão das instituições.
- `profiles`: Perfis de usuários com RBAC (master, admin, user).
- `members`, `roles`, `skills`, `visitors`, `schedules`: Módulos do sistema.

### 2. Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_para_admin
```

## 📦 Execução
```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🎨 Padrão Visual Premium
O projeto utiliza a estética **Modern Minimalist Premium**:
- **Design:** Cards com `rounded-[2.5rem]`, sombras `shadow-2xl` e bordas `slate-200/60`.
- **Animações:** Transições suaves com `animate-in fade-in`.
- **Filtros Avançados:** Busca textual e filtros visuais por Cargos e Habilidades.

## ✨ Novas Funcionalidades
- **Notificação Assistida (Escalas):** Centro de mensagens com links dinâmicos para WhatsApp.
  - Variáveis: Nome, Função e Data automatizados.
  - Estado Visual: Indicador de "Enviado" ✅ para controle de fluxo.
- **Gestão de Visitantes:** Onboarding premium com Empty States motivadores e foco em acolhimento.
- **Tipagem Rigorosa:** Implementação 100% TypeScript com interfaces para relacionamentos do Supabase.
