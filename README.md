# Lunacea Portfolio

[![English](https://img.shields.io/badge/Language-English-blue?style=flat-square)](README.md)
[![日本語](https://img.shields.io/badge/Language-日本語-red?style=flat-square)](README.ja.md)

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE.txt)

Lunacea's portfolio website.
A web application is aimed to be built with interactive 3D elements and modern UI/UX design principles.

🌐 **Website URL**: [https://lunacea.jp](https://lunacea.jp)

## 📜 About

This project serves as a portfolio site showcasing Lunacea's technical skills and creative works.
It is built with a modern tech stack centered around Next.js, focusing on both performance and developer experience.

## 🛠️ Tech Stack

- **Framework**: Next.js (v15.x), React (v19.x)
- **Language**: TypeScript (v5.x)
- **Styling**: Tailwind CSS (v4.x), PostCSS
- **3D Graphics**: Three.js, React Three Fiber
- **Database**: Drizzle ORM (pg, pglite)
- **Authentication**: Clerk (Next.js)
- **Testing**: Vitest, Playwright, Testing Library, Storybook
- **Other Key Libraries**: Zod, React Hook Form

## 🚀 Setup

### ✅ Prerequisites

[![Bun](https://img.shields.io/badge/Bun-1.x-purple?style=flat-square&logo=bun)](https://bun.sh/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-bluegreen?style=flat-square&logo=node.js)](https://nodejs.org/)

### 📋 Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/lunacea-portfolio.git
   cd lunacea-portfolio
   ```
2. Install dependencies:

   ```bash
   bun install
   ```
3. Create environment variable files:

   ```bash
   cp .env .env.local
   cp .env.production .env.production.local
   ```
4. Configure the necessary values (API keys, etc.) in these files

   > **Note**: Both `.env.local` and `.env.production.local` are included in `.gitignore` and will not be pushed to the public repository. You can safely store authentication credentials and API keys in these files.
   >

## 💻 Development

This project is a modern Next.js application using [Bun](https://bun.sh/) as the package manager and runtime.

### 🔄 Development Cycle

1. **Start the local development server**:

   ```bash
   # Next.js development server (with Turbo mode)
   bun run dev:next

   # Or, start all development tools simultaneously (recommended)
   bun run dev
   ```

   > 💡 `bun run dev` executes `dev:next` and `dev:spotlight` in parallel, giving you access to the Spotlight debugging tool.
   >
2. **Code editing**:

   - Edit code in the `src/` directory and see changes immediately with hot reloading
   - TypeScript type checking is performed automatically in your editor and the development server
3. **Database operations** (when needed):

   ```bash
   # Generate migrations from schema changes
   bun run db:generate

   # Run database migrations
   bun run db:migrate

   # Launch the database management UI
   bun run db:studio
   ```
4. **Running tests**:

   ```bash
   # Run unit/component tests
   bun run test

   # Run E2E tests (using Playwright)
   bun run test:e2e
   ```

### 📦 Build and Preview

Create and test a production-like build locally:

```bash
# Build the project
bun run build

# Start the built application
bun run start
```

## 🌐 Deploy

This project is deployed to [Sevalla](https://sevalla.com/) via GitHub.

1. Commit your changes and push to the `main` branch.
2. Sevalla detects changes in the GitHub repository and automatically triggers a build and deployment.
3. After deployment, the latest version is available at [https://lunacea.jp](https://lunacea.jp).

## 📧 Contact

For questions or feedback, please contact:
[contact@lunacea.jp](mailto:contact@lunacea.jp)

## 📄 License

This project is built using the [Next.js Boilerplate](https://github.com/ixartz/Next-js-Boilerplate). For license details, please see `LICENSE.txt`.
