# Boardgame Bot Arena

Boardgame Bot Arena is an online algorithmic battle arena where users write autonomous Python scripts (bots) to play board games against other players or automated opponents. The project is built as a single TypeScript monorepo, utilizing a React frontend and a Node.js/Express backend that spins up isolated Docker containers to execute the user-submitted Python code safely.

## Local Development

### 1. Install Dependencies
Because this project is structured as a monorepo using NPM Workspaces, you only need to run the install command once from the root folder. This will automatically install and link all dependencies for the frontend, backend, and shared packages.

```bash
npm install
```

### 2. Run the Application
To run the app locally, you need to run both the frontend and backend development servers. You can do this by splitting your terminal (or opening two separate terminal windows) and running these two commands:

```bash
npm run dev:backend
npm run dev:frontend
```