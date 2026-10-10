---
name: ai-agent-frontend
description: >-
  Master development guide and coding skill for the MKK AI Agent Frontend repository.
  Use this skill at the beginning of any conversation on the frontend app to understand
  the directory structure, React 19 architecture, Vite config, Tailwind CSS v4 styling,
  SSE streaming parser, TanStack Query caching, Zustand stores, and component conventions without scanning the codebase.
---

# MKK AI Agent - Frontend Architecture & Coding Skill

This skill provides the standalone architectural blueprint, directory structure, and development runbooks for the **MKK AI Agent Frontend** repository (React 19, TypeScript, Vite 8, Tailwind CSS v4, TanStack Query v5, Zustand).

---

## 📁 Frontend Directory Structure

```text
frontend/
├── public/                        # Static public assets & favicon
├── src/
│   ├── assets/                    # SVG assets, logos (logo.svg)
│   ├── components/
│   │   ├── admin/                 # Admin management components
│   │   │   ├── ModelUsage.tsx     # Model consumption analytics
│   │   │   ├── ProviderForm.tsx   # Provider & API key configuration form
│   │   │   ├── ProviderUsage.tsx  # Provider usage distribution
│   │   │   ├── TokenUsage.tsx     # Global token usage analytics
│   │   │   └── user/              # User administration table & status columns
│   │   ├── auth/                  # Authentication forms (Login, SignUp, ResetPassword)
│   │   ├── ui/                    # Reusable dumb UI primitives (Buttons, Modals, Inputs, DataTable)
│   │   └── user/                  # Core user chat components
│   │       ├── chats/
│   │       │   ├── ChatHeader.tsx # Model details, conversation controls, title display
│   │       │   ├── ChatMessages.tsx # Linear message timeline renderer
│   │       │   ├── NavConversations.tsx # Sidebar with debounced search & infinite scroll
│   │       │   └── PromptInput.tsx # User input area with submit & abort triggers
│   │       ├── settings/          # User settings modal (Profile, ChangePassword, Tokens, Usage)
│   │       └── SearchModel.tsx    # Modal for discovering and switching active AI models
│   ├── context/                   # React Context providers
│   │   ├── conversationContext.tsx# Active conversation ID, model selection, draft state
│   │   └── userContext.tsx        # Active user session context
│   ├── hooks/                     # Custom performance & UI hooks
│   │   ├── useBreakpoint.tsx      # Viewport responsive breakpoint detector
│   │   ├── useDebounce.tsx        # Search query debouncing (300ms delay)
│   │   ├── useInfinityScroll.tsx  # IntersectionObserver infinite scrolling trigger
│   │   └── useOutsideClick.tsx    # Modal & dropdown dismiss handler on outside click
│   ├── layouts/                   # Layout wrappers
│   │   ├── admin/                 # AdminLayout, Header, NavBar
│   │   ├── user/                  # UserLayout, NavBar
│   │   └── Footer.tsx             # Global footer
│   ├── page/                      # Route page views
│   │   ├── admin/                 # Admin pages (Dashboard, Providers, User)
│   │   ├── auth/                  # Auth pages (Login, SignUp, EmailVerification, ResetPassword)
│   │   └── user/                  # Core user pages (Home/Chat, Privacy)
│   ├── routes/
│   │   └── AppRoutes.tsx          # React Router v7 routes definition
│   ├── schemas/                   # Zod validation schemas (authSchema, providerSchema, userSchema)
│   ├── services/                  # API network services
│   │   ├── common.ts              # Base Axios instance & response handlers
│   │   └── fetchService.ts        # SSE streaming handler (`parseStreamResponse`)
│   ├── stores/                    # Zustand global client stores
│   │   ├── AppStore.ts            # UI states, sidebar collapse toggle
│   │   └── UserStore.ts           # Authenticated user profile, roles, tokens
│   ├── types/                     # Shared TypeScript interfaces (conversation, user, common)
│   ├── App.tsx                    # Root provider setup (QueryClientProvider, Router, Toastify)
│   ├── index.css                  # Global Tailwind CSS v4 directives
│   └── main.tsx                   # Vite client mount entry point
├── index.html                     # HTML application template
├── package.json                   # Dependencies & npm scripts
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # Root TypeScript config
├── tsconfig.app.json              # App-specific TypeScript config
├── tsconfig.node.json             # Node-specific TypeScript config
└── vite.config.ts                 # Vite bundler configuration
```

---

## 🔄 Frontend Streaming & Execution Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Prompt as PromptInput.tsx
    participant Home as Home.tsx
    participant FS as fetchService.ts
    participant Cache as TanStack Query Cache
    participant API as Backend SSE Endpoint

    User->>Prompt: Submit prompt message
    Prompt->>Home: onSend(prompt)
    Home->>Home: Render optimistic user message in timeline
    Home->>FS: generateStreamContent(prompt, modelId, conversationId)
    FS->>API: POST /conversation/generate-stream-content
    loop SSE Stream Chunks
        API-->>FS: Stream chunk data
        FS->>FS: parseStreamResponse (heals fused chunks)
        FS-->>Home: Dispatch event (coversation, stream, error, end)
        Home-->>User: Append incremental text tokens to active message
    end
    Home->>Cache: Invalidate ['conversations'] to refresh thread title
```

---

## ⚡ Core Streaming Protocol (`src/services/fetchService.ts`)

1. **Chunk Healing**:
   - High-throughput SSE chunks often arrive fused together (e.g. `}{`). `parseStreamResponse` automatically detects and inserts commas (`},{`) before parsing.
2. **Event Types**:
   - `coversation`: Receives created conversation UUID. Updates URL parameter (`/c/:id`).
   - `stream`: Appends real-time incremental text delta to current active message.
   - `error`: Displays toast notification and restores input prompt.
   - `end`: Marks streaming completion and triggers cache invalidation.

---

## 🗃️ State Management Strategy

1. **Server State (TanStack Query v5)**:
   - `['conversations']`: Sidebar thread list (invalidated on stream end, thread rename, delete).
   - `['messages', conversationId]`: Thread messages timeline.
2. **Client Global State (Zustand)**:
   - `UserStore`: Authentication profile, role (`USER` vs `ADMIN`), tokens.
   - `AppStore`: Global UI states, sidebar collapse toggle.
3. **Context State (React Context)**:
   - `ConversationContext`: Holds active model selection, conversation ID, and draft prompt state.

---

## 🪝 Custom Performance Hooks (`src/hooks/`)

- `useDebounce(value, delay = 300)`: Used on search inputs in `NavConversations.tsx` to prevent redundant network calls while typing.
- `useInfinityScroll(callback)`: Encapsulates `IntersectionObserver` to trigger `fetchNextPage` automatically when the user scrolls near the bottom of lists.
- `useBreakpoint()`: Responsive screen width breakpoint detection.
- `useOutsideClick(ref, callback)`: Closes modals, dropdowns, and flyout menus when clicking outside.

---

## ⚙️ Development & Verification Runbook

### Prerequisites
- Node.js v18+

### Commands
```bash
# Start development server (runs on http://localhost:3000 or http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ⚠️ Critical Rules & Conventions

- **Tailwind CSS v4**: Use modern utility classes with responsive variants (`sm:`, `md:`, `lg:`).
- **Optimistic Updates**: Render user prompts immediately in the timeline before network responses resolve.
- **Debounced Search**: Always debounce search inputs to preserve API bandwidth.
- **Safe Keys**: API calls must pass through `fetchService.ts` or `common.ts` with proper token interception.
