# 🤖 AI Agent Web Application

A modern, high-performance, and feature-rich web platform for interacting with AI models, managing streaming conversations, tracking token consumption, and administering agent workflows.

Built with **React 19**, **TypeScript**, **Vite 8**, **Tailwind CSS v4**, and **TanStack React Query**.

---

## 🌟 Key Features

- **💬 Real-Time Streaming Chat Interface**

  - Instant response streaming with custom SSE chunk parsing (`generate-stream-content` / `retry-stream-content`).
  - Markdown rendering and code formatting with `@tanstack/markdown`.
  - Conversation thread history with options to rename, edit, or delete chats.
  - Message regeneration and prompt modification support.
- **🔍 Debounced Search & Conversation Search Modal**

  - Fast, debounced search across conversation history using the custom `useDebounce` hook (300ms delay).
  - Optimized network usage preventing excess API calls while typing.
  - Infinite scroll pagination built with `useInfiniteQuery` and `useInfiniteScroll`.
  - Instant focus and auto-clearing input handling inside a accessible modal UI.
- **🤖 Multi-Model Selection**

  - Seamless model switching per conversation or prompt.
  - Dynamic model discovery modal and quick model selector.
- **📊 Token & Usage Management**

  - Real-time token balance tracking for user accounts.
  - Token top-up and package management forms (`TokenUpdateForm.tsx`).
  - Toast notifications and inline balance guardrails.
- **🛡️ Comprehensive Admin Dashboard**

  - **User Governance**: View user profiles, update status, and track user activity.
  - **Token Administration**: Manage global token rules, view usage analytics, and grant token credits.
  - **System Dashboard**: Telemetry overview of system performance and active sessions.

---

## 🪝 Custom Hooks Catalog

The application includes dedicated custom React hooks designed for performance optimization and UI behavior:

| Hook                            | Purpose / Functionality                                                                                                        |
| :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| **`useDebounce`**       | Debounces state values (e.g. search inputs) by a configurable delay (default`300ms`) to minimize redundant network requests. |
| **`useInfiniteScroll`** | IntersectionObserver hook that detects scroll triggers and fires`fetchNextPage` for infinite scrolling.                      |
| **`useBreakpoint`**     | Detects screen size breakpoints for responsive layouts.                                                                        |
| **`useOutsideClick`**   | Handles clicks outside designated containers to close dropdowns and modals.                                                    |

---

## 🛠️ Tech Stack

| Domain                          | Technology / Library                                                     |
| :------------------------------ | :----------------------------------------------------------------------- |
| **Framework**             | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool**            | [Vite 8](https://vitejs.dev/)                                               |
| **Styling**               | [Tailwind CSS v4](https://tailwindcss.com/) + Lucide Icons                  |
| **State Management**      | [Zustand](https://zustand-demo.pmnd.rs/)                                    |
| **Data Fetching & Cache** | [TanStack React Query v5](https://tanstack.com/query/latest)                |
| **Routing**               | [React Router DOM v7](https://reactrouter.com/)                             |
| **Forms & Validation**    | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)      |
| **Notifications**         | [React Toastify](https://fkhadra.github.io/react-toastify/introduction/)    |

---

## 📁 Project Structure

```text
frontend/
├── public/                # Static public assets
├── src/
│   ├── components/        # Reusable UI & domain components
│   │   ├── admin/         # Admin components (User tables, Token management)
│   │   ├── auth/          # Authentication forms & layout components
│   │   ├── ui/            # UI components (Buttons, Modals, Inputs)
│   │   └── user/          # User interface components (SearchModel, ChatHeader, NavConversations)
│   ├── context/           # React Context providers (UserContext, ConversationContext)
│   ├── hooks/             # Custom React hooks (useDebounce, useInfiniteScroll, useBreakpoint)
│   ├── layouts/           # Page layouts (UserLayout, AdminLayout, AuthLayout)
│   ├── page/              # Page routes & views
│   │   ├── admin/         # Admin views (Dashboard, User, Tokens)
│   │   ├── auth/          # Authentication pages (Login, Register)
│   │   └── user/          # User views (Home, Privacy)
│   ├── routes/            # Application router definitions
│   ├── schemas/           # Zod validation schemas
│   ├── services/          # API & fetch services (`fetchService.ts`)
│   ├── stores/            # Zustand global stores (`UserStore`)
│   ├── types/             # TypeScript type interfaces & definitions
│   ├── App.tsx            # Main application root component
│   └── main.tsx           # Vite entry point
├── index.html             # Main HTML template
├── package.json           # Project dependencies & scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **npm** (or `pnpm` / `yarn`)

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd ai-agent/frontend
   ```
2. **Install dependencies**:

   ```bash
   npm install
   ```
3. **Start the development server**:

   ```bash
   npm run dev
   ```

   The application will be running locally at [http://localhost:3000](http://localhost:3000).

---

## 📜 Available Scripts

- **`npm run dev`**: Starts the Vite local development server on port `3000`.
- **`npm run build`**: Runs type checking (`tsc -b`) and builds the production bundle with Vite.
- **`npm run preview`**: Serves the built production bundle locally for previewing.
- **`npm run lint`**: Runs ESLint to verify code quality and coding standards.

---

## 🔌 API & Backend Integration

The application communicates with the AI Agent backend via `src/services/fetchService.ts`:

- **REST Endpoints**: Form submissions, authentication, conversations,  user administration, tokens.
- **Streaming Endpoints (`/generate-stream-content`, `/retry-stream-content`)**: Real-time chunked text generation over Server-Sent Events (SSE). Chunks are continuously parsed and rendered in real-time in `Home.tsx`.
