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

## ❓ ALWAYS ASK CLARIFICATION ON DOUBT (NO ASSUMPTIONS)

> [!IMPORTANT]
> **If in doubt, ALWAYS ask the user directly — NEVER make assumptions or unilateral decisions.**
> 
> - If requirements, parameters, or design choices are ambiguous, do not guess or decide by yourself.
> - Pause and prompt the user with clear questions or options before proceeding.

---

## 🚫 NO GIT WRITE ACTIONS (DO NOT RUN GIT ADD, COMMIT, PUSH)

> [!CAUTION]
> **NEVER stage, commit, or push git changes without explicit user permission.**
> 
> - Under **no circumstances** should agent tools run `git add`, `git commit`, `git push`, `git checkout`, `git reset`, `git rebase`, `git merge`, or any other mutating git command unless the user explicitly requests it.
> - **Read-only git commands only**: Commands such as `git status`, `git diff`, and `git log` are permitted for reviewing and inspecting changes.
> - Always leave staging (`git add`), committing, and pushing entirely to the user.

---

## 📁 Repository Structure

```text
frontend/
├── public/                        # Static assets & favicon
├── src/
│   ├── assets/                    # Logos & SVG assets
│   ├── components/
│   │   ├── admin/                 # Admin panels (ProviderForm, ModelUsage, User tables, Tools management)
│   │   ├── auth/                  # LoginForm, RegisterForm, ResetPassword forms
│   │   ├── common/                # MetaHead.tsx for dynamic titles & OpenGraph tags
│   │   ├── ui/                    # DataTable, Modal, Button, Input primitives
│   │   └── user/                  # Chat components, AgentExecutionDialog, UserAgentCard, UserToolCard
│   ├── context/                   # ConversationContext & UserContext
│   ├── hooks/                     # useAppConfig, useRecaptcha, useDebounce, useInfinityScroll
│   ├── layouts/                   # UserLayout, AdminLayout, Footer
│   ├── lib/                       # fetchService.ts (SSE streaming & 401 refresh), queryClient.ts
│   ├── page/
│   │   ├── admin/                 # Dashboard, Providers, Tools, User
│   │   ├── auth/                  # Login, SignUp, GoogleCallback, ResetPassword
│   │   └── user/                  # Conversation.tsx, SharedConversation.tsx, Tools.tsx, Privacy
│   ├── routes/                    # AppRoutes.tsx
│   ├── schemas/                   # Zod validation schemas
│   ├── stores/                    # Zustand AppStore & UserStore
│   ├── types/                     # TypeScript types (conversation.ts, user.ts)
│   ├── App.tsx                    # Root provider shell
│   └── main.tsx                   # Client mount
├── .agents/
│   ├── rules/                     # no-env.md, ask-clarification.md
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
2. **File Attachments & Preview (`FileAttachment.tsx`, `FilePreviewModal.tsx`)**:
   - Files are validated (documents & images) with filename deduplication.
   - Attachment pills above `PromptInput` use responsive max-width (`max-w-44 sm:max-w-52 w-fit`), word ellipsis (`truncate min-w-0`), and `title` hover tags.
   - Image cards in chat history use full-width images (`w-full h-full object-cover`) and fixed widths (`w-48 sm:w-52`) with native title tooltips.
   - Clicking an attachment pill triggers `FilePreviewModal` for text/code syntax viewing, image previews, or document inspection.
   - File uploads are streamed via `FormData` in `fetchService.ts` with centralized 401 token refresh handling.
3. **Dynamic Header SEO (`<MetaHead>`)**:
   - Always use `<MetaHead>` (`src/components/common/MetaHead.tsx`) across all user, admin, and shared views for dynamic document titles and OpenGraph tags.
4. **Conversation Sharing UI (`src/components/user/chats/ShareConversation.tsx`)**:
   - Default share type is `RESTRICTED`.
   - When `RESTRICTED` is selected, the share link is hidden.
   - When `SPECIFIC_USER` is selected, validate email tags. Automatically validate and merge uncommitted text in the email input upon form submission.
5. **Security & Anti-Bot Protection**:
   - Google reCAPTCHA v3 (`useRecaptcha.ts` hook) is active **ONLY on unauthorized auth pages** (`Login`, `SignUp`, `ResetPassword`).
   - Upon component unmount or navigation to authorized layouts (`Layout.tsx`, `AdminLayout.tsx`), hide/clean up `.grecaptcha-badge` so it never covers chat or admin screens.
   - Google OAuth2 callback (`GoogleCallback.tsx`) prevents duplicate toast notifications using `processedRef` and a unique `toastId: "google-login-success"`.
6. **State Management**:
   - TanStack React Query v5 for server data (`['conversations']`, `['messages', conversationId]`).
   - Zustand for client stores (`UserStore.ts`, `AppStore.ts`).
   - `ConversationContext` for active model selection, draft prompts, and scroll-to-bottom coordinator (`showScrollBottom`, `scrollToBottom`).
7. **Dynamic Scroll-to-Bottom & Timeline Actions**:
   - Floating scroll-to-bottom button is in `PromptInput.tsx` anchored dynamically at `bottom-full mb-3 left-1/2 -translate-x-1/2` relative to dynamic input height.
   - All user message turns in the timeline are editable (not only the last message).
8. **Tailwind CSS Unit Conventions**:
   - **NEVER use arbitrary pixel classes like `xx-[100px]` or `[...px]`** (`h-[100px]`, `min-h-[300px]`, `max-w-[150px]`, `text-[10px]`).
   - **Always convert pixel values using `value = px / 4`**:
     - `h-[100px]` => `h-25` (100 / 4)
     - `min-h-[300px]` => `min-h-75` (300 / 4)
     - `max-w-[150px]` => `max-w-37.5` (150 / 4)
     - `max-w-[200px]` => `max-w-50` (200 / 4)
   - For font sizes, use standard utilities (`text-xs`, `text-sm`, `text-base`) rather than `text-[...px]`.
10. **Strict Repository Isolation**:
    - Frontend and backend are separate, independent repositories. NEVER create common/root README files or agent files outside `frontend/`.
11. **Dynamic Configuration Hydration (`useAppConfig`)**:
    - Application limits (`maxFileSize`, `maxFiles`, `allowedExtensions`, `allowedMimeTypes`) and agent dynamic field definitions (`maxDynamicFields = 5`, `fieldTypeList`) are dynamically retrieved from backend `GET /config` via `useAppConfig.ts` with React Query. Do NOT hardcode or duplicate these settings in a separate frontend config file.
12. **AI Agent Tools & Dynamic Workflows**:
    - Tools and agents are accessible via `/tools` and configured via `/admin/tools`.
    - Single indigo color theme for all buttons, highlights, badges, and toggle switches.
    - Page layout: Top search card with centered icon; ToolCard encloses child AgentCards.
    - Agent cards clamp titles to 2 lines and descriptions to 3 lines with native tooltips; execution dialog displays full text.
    - `GET /tool` returns lightweight metadata; dynamic fields (minimum 1, maximum 5 allowed) and prompts load on-demand via `GET /agent/:id`. Duplicate field keys are validated and prevented.
    - Options textarea in `DynamicFieldBuilder` allows Shift+Enter for newlines (1 empty line allowed, auto-trimmed on submit). Agent thumbnail removal is supported in `AgentFormModal`.
    - Static asset images use `/uploads/agent` proxied via Vite and resolved through `getStaticAssetUrl(path)`.
    - Executing an agent submits dynamic inputs, redirects immediately to `/:conversationId`, and streams the response with conversational follow-up support. Agent system prompts are isolated on the server and never handled by the frontend.

---

## 🧪 Verification Standard

Before concluding any work, run the production build to ensure 0 TypeScript compilation errors:

```bash
# Node environment path helper
export PATH="/home/mkk/.nvm/versions/node/$(ls /home/mkk/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:$PATH"

# Build verification
npm run build
```
