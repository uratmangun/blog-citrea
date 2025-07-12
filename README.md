# Citrea Blog

A modern, full-featured blog platform built with React, Vite, and Web3 integration. This project features a clean, responsive design with support for creating, editing, and managing blog posts, user authentication, and blockchain wallet connectivity.

## 🚀 Features

- **Modern Tech Stack**: Built with React 19, Vite, TypeScript, and Tailwind CSS
- **Web3 Integration**: RainbowKit wallet connection with support for multiple chains
- **Database**: Supabase for backend services and data management
- **UI Components**: shadcn/ui for beautiful, accessible components
- **Authentication**: User registration and login system
- **Blog Management**: Create, edit, and delete blog posts with rich content
- **Responsive Design**: Mobile-first approach with modern styling
- **Comments System**: Interactive comment sections with reply functionality

## 📦 Installation

Install dependencies using Bun:

```bash
bun install
```

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_PUBLIC_SUPABASE_URL=your_supabase_url
VITE_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🛠️ Development

To start the development server:

```bash
bun run dev
```

This will start the Vite development server at `http://localhost:3000` with hot module replacement.

## 🏗️ Production

To build for production:

```bash
bun run build
```

To preview the production build locally:

```bash
bun run preview
```

This will serve the production build at `http://localhost:4173/`

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── BlogPostPage.tsx
│   ├── CreatePostPage.tsx
│   ├── DashboardPage.tsx
│   └── ...
├── lib/                # Utilities and configurations
│   ├── supabaseClient.ts
│   └── utils.ts
├── styles/             # Global styles
└── frontend.tsx        # App entry point
```

## 🌐 Deployment

This project is configured for easy deployment on modern hosting platforms:

- **Netlify**: Deploy directly from your repository
- **Vercel**: Zero-config deployment with automatic builds
- **Static Hosting**: Any static file hosting service

## 🔧 Built With

- [React 19](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool and development server
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components
- [Supabase](https://supabase.com/) - Backend as a Service
- [RainbowKit](https://www.rainbowkit.com/) - Web3 wallet connection
- [React Router](https://reactrouter.com/) - Client-side routing
- [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
