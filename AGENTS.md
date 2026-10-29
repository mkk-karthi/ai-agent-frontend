# Frontend Development Rules & Agent Guidelines

Welcome to the **MKK AI Agent - Frontend** repository. This client application provides the modern chat interface (React 19, Vite, Tailwind CSS v4, TanStack Query v5, Zustand) for the MKK AI Agent platform.

All AI agents working within this repository **MUST** follow these core guidelines without exception.

---

## ⛔ CRITICAL SECURITY RULE: Environment Isolation (.env)

> [!CAUTION]
> **NEVER read, inspect, search, or write `.env` files.**
> 
> - Under **no circumstances** should agent tools (`view_file`, `replace_file_content`, `multi_replace_file_content`, `write_to_file`, `grep_search`, `run_command` with `cat`/`head`/`tail`/`grep`, etc.) be used to access or modify `.env` files containing live secrets, keys, or credentials.
> - **Always** inspect and modify `.env.example` as the canonical template when documenting, adding, or updating environment variables.
> - When guiding users on setup, direct them to copy `.env.example` to `.env` and populate their keys manually.

---

## 📁 Repository Structure

```text
frontend/
├── public/                        # Static assets & favicon
├── src/
│   ├── assets/                    # Logos & SVG assets
│   ├── components/
│   │   ├── admin/                 # Admin panels (ProviderForm, ModelUsage, User tables)
│   │   ├── auth/                  # LoginForm, RegisterForm, ResetPassword forms
│   │   ├── common/                # MetaHead.tsx for dynamic titles & OpenGraph tags
│   │   ├── ui/                    # DataTable, Modal, Button, Input primitives
│   │   └── user/                  # ChatHeader, ChatMessages, ShareConversation, Settings
│   ├── context/                   # ConversationContext & UserContext
│   ├── hooks/                     # useRecaptcha, useDebounce, useInfinityScroll
│   ├── layouts/                   # UserLayout, AdminLayout, Footer
│   ├── lib/                       # fetchService.ts (SSE streaming), queryClient.ts
│   ├── page/
│   │   ├── admin/                 # Dashboard, Providers, User
│   │   ├── auth/                  # Login, SignUp, GoogleCallback, ResetPassword
│   │   └── user/                  # Conversation.tsx, SharedConversation.tsx, Privacy
│   ├── routes/                    # AppRoutes.tsx
│   ├── schemas/                   # Zod validation schemas
│   ├── stores/                    # Zustand AppStore & UserStore
│   ├── types/                     # TypeScript types (conversation.ts, user.ts)
│   ├── App.tsx                    # Root provider shell
│   └── main.tsx                   # Client mount
├── .agents/
│   ├── rules/no-env.md            # Standalone .env protection rule
│   └── skills/ai-agent-frontend/  # Frontend architecture skill
├── .env.example                   # Canonical environment template
├── package.json                   # Dependencies & build scripts
└── vite.config.ts                 # Vite bundler configuration
```

---

## 🛠️ Architecture Conventions & Rules

1. **Conversation Page Flow (`src/page/user/Conversation.tsx`)**:
   - When navigating to `/c/:id`, first validate and retrieve the conversation object.
   - If retrieval fails, display an error state with a "New Conversation" button and **hide the prompt input**.
   - If retrieval succeeds, proceed to fetch messages and render the chat timeline.
2. **Dynamic Header SEO (`<MetaHead>`)**:
   - Always use `<MetaHead>` (`src/components/common/MetaHead.tsx`) across all user, admin, and shared views for dynamic document titles and OpenGraph tags.
3. **Conversation Sharing UI (`src/components/user/chats/ShareConversation.tsx`)**:
   - Default share type is `RESTRICTED`.
   - When `RESTRICTED` is selected, the share link is hidden.
   - When `SPECIFIC_USER` is selected, validate email tags. Automatically validate and merge uncommitted text in the email input upon form submission.
4. **Security & Anti-Bot Protection**:
   - Google reCAPTCHA v3 (`useRecaptcha.ts` hook) is active **ONLY on unauthorized auth pages** (`Login`, `SignUp`, `ResetPassword`).
   - Upon component unmount or navigation to authorized layouts (`Layout.tsx`, `AdminLayout.tsx`), hide/clean up `.grecaptcha-badge` so it never covers chat or admin screens.
   - Google OAuth2 callback (`GoogleCallback.tsx`) prevents duplicate toast notifications using `processedRef` and a unique `toastId: "google-login-success"`.
5. **State Management**:
   - TanStack React Query v5 for server data (`['conversations']`, `['messages', conversationId]`).
   - Zustand for client stores (`UserStore.ts`, `AppStore.ts`).
   - `ConversationContext` for active model selection and draft prompts.

---

## 🧪 Verification Standard

Before concluding any work, run the production build to ensure 0 TypeScript compilation errors:

```bash
# Node environment path helper
export PATH="/home/mkk/.nvm/versions/node/$(ls /home/mkk/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:$PATH"

# Build verification
npm run build
```
