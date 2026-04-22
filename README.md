# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## npm init -y
## npm install better-sqlite3
## install sqlite viewer extension sa vscode

## Local data sync

The backend stores kiosk content in `my-custom-backend/app-data.db`, which is not committed to git. Fresh clones are auto-seeded from `my-custom-backend/seed-data.json` on backend startup when the local tables are empty.

If you update the database on your machine and want to refresh the committed snapshot, run `node scripts/export-db-snapshot.cjs` from the repo root, then commit the updated `my-custom-backend/seed-data.json`.

## Electron Desktop App

This project is now configured to run as an Electron desktop app.

## Standalone Web Kiosk (No Electron)

If you want to run the kiosk without opening the Electron launcher, use:

```bash
npm run standalone
```

This command:
- starts the backend server from `my-custom-backend/server.js`
- serves the built frontend at `http://127.0.0.1:3333`
- auto-opens the kiosk URL in your browser

To stop it, close the terminal running the command.

### Run in desktop dev mode

```bash
npm run electron:dev
```

This starts Vite and Electron together.

### Build Windows installer/EXE

```bash
npm run electron:build
```

Output files are generated in `release/`.

### App icon for EXE

Put your icon at:

`build/icon.ico`

The Electron builder config uses this file for Windows app/installer branding.