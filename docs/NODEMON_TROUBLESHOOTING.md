Nodemon Troubleshooting (Windows)

Use these steps if you see: 'nodemon' is not recognized.

- Install dependencies:
  - Backend only: `cd backend && npm install`
  - Or from project root: `npm run setup`
- Start backend:
  - From root: `npm run dev:backend-only`
  - Directly in backend: `npm run dev`
- Quick test with npx (bypasses PATH):
  - `cd backend && npx nodemon server.js`
- Verify Node/npm versions:
  - `node -v` (>= 18)
  - `npm -v`
- Clean reinstall (if cache issues):
  - `cd backend && rd /s /q node_modules && del package-lock.json && npm install`
- Check file exists:
  - Ensure `backend/server.js` exists (it does in this repo).

Notes
- Root scripts use `npm --prefix backend ...` to avoid shell `cd` quirks on Windows.
- No global install of nodemon is required when running via npm scripts.
