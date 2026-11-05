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
│   │   ├── common/                # Common components (MetaHead.tsx dynamic SEO & OG headers)
│   │   ├── ui/                    # Reusable dumb UI primitives (Buttons, Modals, Inputs, DataTable)
│   │   └── user/                  # Core user chat components
│   │       ├── chats/
│   │       │   ├── ChatHeader.tsx # Model details, conversation controls, title & share button
│   │       │   ├── ChatMessages.tsx # Linear message timeline renderer (supports isShared)
│   │       │   ├── ChatSkeleton.tsx # Loading skeleton placeholders for chat timeline
│   │       │   ├── ConversationOptions.tsx # Conversation dropdown menu with share option
│   │       │   ├── FileAttachment.tsx # Visual attachment pill with preview and remove triggers
│   │       │   ├── FilePreviewModal.tsx # Attachment preview modal for documents & images
│   │       │   ├── NavConversations.tsx # Sidebar with debounced search & infinite scroll
│   │       │   ├── PromptInput.tsx # User input area with submit & abort triggers
│   │       │   └── ShareConversation.tsx # Share modal (Restricted default, Public, Specific User)
│   │       ├── settings/          # User settings modal (Profile, ChangePassword, Tokens, Usage)
│   │       └── SearchModel.tsx    # Modal for discovering and switching active AI models
│   ├── context/                   # React Context providers
│   │   ├── conversationContext.tsx# Active conversation ID, model, draft state & scroll-to-bottom coordinator
│   │   └── userContext.tsx        # Active user session context
│   ├── hooks/                     # Custom performance & UI hooks
│   │   ├── useBreakpoint.tsx      # Viewport responsive breakpoint detector
│   │   ├── useDebounce.tsx        # Search query debouncing (300ms delay)
│   │   ├── useInfinityScroll.tsx  # IntersectionObserver infinite scrolling trigger
│   │   ├── useOutsideClick.tsx    # Modal & dropdown dismiss handler on outside click
│   │   └── useRecaptcha.ts        # Google reCAPTCHA v3 invisible token executor
│   ├── layouts/                   # Layout wrappers
│   │   ├── admin/                 # AdminLayout, Header, NavBar
│   │   ├── user/                  # UserLayout, NavBar (collapsible Pinned & Recents)
│   │   └── Footer.tsx             # Global footer
│   ├── lib/                       # Core utilities & API clients
│   │   ├── fetchService.ts        # SSE streaming handler (`parseStreamResponse`), token refresh
│   │   └── queryClient.ts         # TanStack QueryClient instance & cache configuration
│   ├── page/                      # Route page views
│   │   ├── admin/                 # Admin pages (Dashboard, Providers, User)
│   │   ├── auth/                  # Auth pages (Login, SignUp, GoogleCallback, EmailVerification, ResetPassword)
│   │   └── user/                  # Core user pages (Conversation/Chat, Privacy, SharedConversation)
│   ├── routes/
│   │   └── AppRoutes.tsx          # React Router v7 routes definition (/auth/google/callback, /share/:id)
│   ├── schemas/                   # Zod validation schemas (authSchema, providerSchema, userSchema, conversationSchema)
│   ├── stores/                    # Zustand global client stores
│   │   ├── AppStore.ts            # UI states, sidebar collapse toggle
│   │   └── UserStore.ts           # Authenticated user profile, roles, tokens
│   ├── types/                     # Shared TypeScript interfaces (conversation, user, common)
│   ├── App.tsx                    # Root provider setup (QueryClientProvider, Router, Toastify)
│   ├── common.ts                  # Base Axios instance & response handlers
│   ├── data.tsx                   # Static icon & navigation datasets
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
    participant Conversation as Conversation.tsx
    participant FS as lib/fetchService.ts
    participant Cache as TanStack Query Cache
    participant API as Backend SSE Endpoint

    User->>Prompt: Submit prompt message
    Prompt->>Conversation: onSend(prompt)
    Conversation->>Conversation: Render optimistic user message in timeline
    Conversation->>FS: generateStreamContent(prompt, modelId, conversationId)
    FS->>API: POST /conversation/generate-stream-content
    loop SSE Stream Chunks
        API-->>FS: Stream chunk data
        FS->>FS: parseStreamResponse (heals fused chunks)
        FS-->>Conversation: Dispatch event (coversation, stream, error, end)
        Conversation-->>User: Append incremental text tokens to active message
    end
    Conversation->>Cache: Invalidate ['conversations'] to refresh thread title
```

---

## 💬 Conversation Lifecycle & Error Handling (`src/page/user/Conversation.tsx`)

1. **Two-Stage Loading & Skeleton States**:
   - When mounting or navigating to `/c/:id`, `Conversation.tsx` first fetches the conversation record via `getConversation`.
   - While conversations or messages load, `ChatSkeleton.tsx` renders smooth animated skeleton blocks in the message timeline.
   - If conversation retrieval fails (e.g. 404 Not Found or 403 Forbidden):
     - Displays a clear error banner/state with a **"New Conversation"** button directing the user to `/new`.
     - **Hides the prompt input completely** so invalid messages cannot be dispatched.
   - If conversation retrieval succeeds, proceeds to fetch conversation message history (`getConversationMessages`) and renders the chat timeline.
2. **Prompt Input Lifecycle & Error Reversion**:
   - On submit, `PromptInput.tsx` immediately clears the text prompt and any attached files.
   - If a conversation creation or streaming error occurs, `restoreState(prompt, files)` is invoked via `promptInputRef` to instantly restore the user's text and attachments, preventing input loss.
3. **Error Highlighting & Retry (`ChatMessage.tsx`)**:
   - Assistant turns with `isError: true` render inside a distinct red-tinted alert card (`bg-red-50 dark:bg-red-950/30 border-red-300`) with an `AlertCircle` warning icon.
   - Includes an active **Retry** button that re-triggers response generation from that point.
4. **Dynamic Header SEO (`<MetaHead>`)**:
   - Hydrates document `<title>` with the active conversation title (or fallback "AI Agent - Conversational Intelligence Platform").
   - Applied consistently across user chat, shared conversations, admin dashboards, and settings.

---

## ⚡ Centralized Fetch & Streaming Service (`src/lib/fetchService.ts`)

1. **Centralized Response & 401 Token Refresh**:
   - `handleResponse`: Standardized response parser. Automatically detects 401 Unauthorized responses, triggers token refresh (`/auth/refresh-token`), and seamlessly replays the failed request with the new access token.
2. **Chunk Healing**:
   - High-throughput SSE chunks often arrive fused together (e.g. `}{`). `parseStreamResponse` automatically detects and inserts commas (`},{`) before parsing.
3. **Event Types**:
   - `coversation`: Receives created conversation UUID. Updates URL parameter (`/c/:id`).
   - `stream`: Appends real-time incremental text delta to current active message.
   - `error`: Displays toast notification and restores input prompt.
   - `end`: Marks streaming completion and triggers cache invalidation.
4. **Multipart File Attachment Streaming**:
   - Automatically packs prompt, model ID, conversation ID, and attached files into `FormData` when attachments exist, sending as `multipart/form-data` to the streaming endpoint.

---

## 📎 File Attachments & Preview Engine (`src/components/user/chats/`)

1. **Attachment Upload & Badges (`PromptInput.tsx`, `FileAttachment.tsx`)**:
   - Supports file selection and drag-and-drop for documents (PDF, Word, text, code) and images with filename deduplication.
   - Attachment pills in `PromptInput.tsx` use responsive max-width (`max-w-44 sm:max-w-52 w-fit`), word ellipsis (`truncate min-w-0`), and `title` tooltips.
   - Image cards in `FileAttachment.tsx` display full-width images (`w-full h-full object-cover`) in cards (`w-48 sm:w-52`) with truncated names and `title` attributes.
2. **Interactive Preview Modal (`FilePreviewModal.tsx`)**:
   - Clicking any attachment pill opens an interactive modal supporting text/code syntax viewing, image zoom, embedded PDF reader, and document metadata preview.
3. **Authenticated Blob Streaming & Downloads (`src/hooks/useAttachmentUrl.ts`)**:
   - Standard `<img>` and `<iframe>` elements cannot transmit `Authorization` headers. The `useAttachmentBlobUrl` hook fetches files as binary blobs using `fetchService.get(endpoint, undefined, "blob")` (passing Bearer tokens and auto-refreshing expired tokens) and transforms them into memory object URLs (`URL.createObjectURL(blob)`).
   - Blob URLs are tied to TanStack Query caching and automatically revoked (`URL.revokeObjectURL`) upon component unmount to prevent memory leaks.
   - `downloadAttachmentFile(endpoint, filename)` downloads protected attachments securely with authentication headers.
4. **Dynamic Scroll-to-Bottom & Timeline Actions**:
   - Floating scroll-to-bottom button is located in `PromptInput.tsx`, positioned dynamically at `bottom-full mb-3 left-1/2 -translate-x-1/2` based on variable input height.
   - Coordinated via `ConversationContext` (`showScrollBottom`, `scrollToBottom`), triggered by scroll offset thresholds in `ChatMessages.tsx`.
   - All user message turns in the conversation timeline support in-place editing, not only the most recent turn.

---

## 🗃️ State Management Strategy

1. **Server State (TanStack Query v5 via `src/lib/queryClient.ts`)**:
   - Configured in `src/lib/queryClient.ts` with `staleTime: 1 hour` and `retry: 1`.
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
- `useAttachmentBlobUrl(endpoint, enabled)`: Asynchronously streams protected attachment binary blobs using TanStack Query, generates revocable Object URLs for `img` and `iframe` previews, and ensures clean lifecycle revocation without memory leaks.
- `useRecaptcha()`: Dynamically loads Google reCAPTCHA v3 script on unauthorized authentication pages (`Login`, `SignUp`, `ResetPassword`) with automatic cleanup hiding the `.grecaptcha-badge` upon unmount or navigating to authorized pages.

---

## 🔗 Conversation Sharing & Collapsible Navigation

1. **Share Modal (`ShareConversation.tsx`)**:
   - Manages sharing state via React Hook Form and Zod (`conversationSchema.ts`).
   - Defaults to `RESTRICTED` share type, hiding the share link until changed to `PUBLIC` or `SPECIFIC_USER`.
   - Fetches available share options (`/conversation/share/options`) and existing settings (`/conversation/:id`).
   - Supports `PUBLIC` links and `SPECIFIC_USER` access with dynamic email tagging and inline error validation.
   - Automatically merges and validates any uncommitted text in the email input upon form submission.
   - Provides one-click clipboard link copying (`/share/:id`).

2. **Public Shared View (`SharedConversation.tsx`)**:
   - No-auth public page mounted at `/share/:id`.
   - Reads conversation metadata from `/shared/conversation/:id` and loads messages using `ChatMessages` (`isShared={true}`).
   - Displays share link copy button and contextual "New Chat" (if logged in) or "Log in" action buttons.

3. **Collapsible Sidebar Sections (`NavBar.tsx`)**:
   - `isPinnedOpen` and `isRecentOpen` states manage expansion of the **Pinned** and **Recents** conversation lists.
   - Headers include `ChevronDown` icons that smoothly rotate `-rotate-90` on collapse.
   - Seamless infinite scrolling pagination without scroll-jumping on page fetches.

---

## 🔐 Authentication, OAuth2 & Anti-Bot Protocols

1. **Google OAuth2 & Secure Token Flow**:
   - Initiated via native anchor `<a href="/api/auth/google">` in `Login.tsx` and `SignUp.tsx`.
   - Backend redirects to `/auth/google/callback?token=${accessToken}` without exposing personal user data in URL query strings.
   - `GoogleCallback.tsx` captures the token, sets it into `UserStore`, securely fetches profile data via `GET /api/auth/user`, displays a deduplicated success toast (`processedRef` + `toastId: "google-login-success"`), and navigates home.

2. **Hybrid Password Management**:
   - `Account.tsx` checks `isCreatePassword = !user?.hasPassword`.
   - If the user logged in via Google and has no password, the settings tab dynamically renders **"Create Password"** (omitting the Old Password field).
   - Once submitted, the backend hashes the password, marks `hasPassword: true`, and the UI dynamically converts to "Change Password".
   - Accounts without a set password are prevented from logging in via email & password until one is created.

3. **Scoped Google reCAPTCHA v3 Bot Defense**:
   - `executeRecaptcha(action)` is called prior to network mutation in `Login.tsx` (`login`), `SignUp.tsx` (`register`), and `ResetPassword.tsx` (`forgot_password`, `reset_password`).
   - Attaches `captchaToken` to request bodies for backend verification.
   - **Isolation & Cleanup**: The Google badge `.grecaptcha-badge` is mounted strictly on unauthenticated auth routes and automatically unmounted/hidden when navigating into the authenticated app (`Layout.tsx`, `AdminLayout.tsx`).

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

- **Tailwind CSS v4 & Unit Conventions**:
  - **NEVER use arbitrary pixel classes like `xx-[100px]` or `[...px]`** (e.g. `h-[100px]`, `min-h-[300px]`, `max-w-[150px]`, `text-[10px]`).
  - **Always convert pixel values to standard Tailwind units using `value = px / 4`**:
    - `h-[100px]` => `h-25` (100 / 4)
    - `min-h-[300px]` => `min-h-75` (300 / 4)
    - `max-w-[150px]` => `max-w-37.5` (150 / 4)
    - `max-w-[200px]` => `max-w-50` (200 / 4)
  - **Typography**: Always use standard typography scale classes (`text-xs`, `text-sm`, `text-base`, etc.) instead of arbitrary pixel font sizes like `text-[10px]`.
  - Use modern utility classes with responsive variants (`sm:`, `md:`, `lg:`).
- **Optimistic Updates**: Render user prompts immediately in the timeline before network responses resolve.
- **Debounced Search**: Always debounce search inputs to preserve API bandwidth.
- **Safe Keys**: API calls must pass through `fetchService.ts` or `common.ts` with proper token interception.
- **Header Metadata**: Always use `<MetaHead>` on route page views to ensure accurate dynamic document titles and OpenGraph tags.
- **Strict Repository Isolation**: Frontend and backend are separate, independent repositories. NEVER create common/root README files, root agent configs, or shared parent files outside the `frontend/` directory.
- **Environment Protection**: **NEVER read or write `.env` files under any circumstances**. Never inspect, read, print, or modify `.env` or any sensitive credential files. Use `.env.example` as the canonical reference template for variable names and schemas.
- **No Direct Database Queries**: **NEVER read, execute, or write raw database queries**. All data operations must remain within frontend application state and API client conventions.
