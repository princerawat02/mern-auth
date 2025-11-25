# MERN Auth — Server

Lightweight Express server providing authentication (JWT + refresh tokens) and user management for a MERN stack application.

## Technologies
- Node.js, Express
- MongoDB (mongoose)
- JSON Web Tokens (JWT)
- bcrypt (password hashing)
- dotenv

## Quickstart

1. Install dependencies
```bash
cd server
npm install
```

2. Create `.env` in the project root with values like:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-auth
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

3. Run in development
```bash
npm run dev
```

4. Start for production
```bash
npm start
```

## Environment variables
- PORT — server port (default 5000)
- MONGO_URI — MongoDB connection string
- JWT_ACCESS_SECRET — secret for access tokens
- JWT_REFRESH_SECRET — secret for refresh tokens
- ACCESS_TOKEN_EXPIRY — e.g. 15m
- REFRESH_TOKEN_EXPIRY — e.g. 7d

## Available scripts (package.json)
- `npm run dev` — start server with nodemon
- `npm start` — start production server (node)
- `npm test` — run tests (if provided)

## API (example)
Base URL: /api

- POST /api/auth/register
    - Body: { "name": "User", "email": "user@example.com", "password": "password" }
    - Returns: user data (no password) and tokens

- POST /api/auth/login
    - Body: { "email": "...", "password": "..." }
    - Returns: accessToken, refreshToken, user

- POST /api/auth/refresh
    - Body: { "refreshToken": "..." }
    - Returns: new accessToken (and optionally new refreshToken)

- GET /api/auth/me
    - Headers: Authorization: Bearer <accessToken>
    - Returns: current authenticated user

- POST /api/auth/logout
    - Body: { "refreshToken": "..." }
    - Invalidates refresh token

Example curl:
```bash
curl -X POST -H "Content-Type: application/json" \
 -d '{"email":"user@example.com","password":"password"}' \
 http://localhost:5000/api/auth/login
```

## Auth flow
1. Client logs in -> server issues access token (short-lived) and refresh token (long-lived).
2. Client uses access token to call protected routes.
3. When access token expires, client calls /auth/refresh with refresh token to obtain a new access token.
4. Logout invalidates the refresh token on server.

## Project structure (suggested)
- /config — DB and env config
- /controllers — request handlers
- /models — mongoose schemas (User, Token)
- /routes — route definitions
- /middleware — auth, error handling
- /utils — helpers
- server.js / app.js — app entry

## Notes
- Store refresh tokens securely (httpOnly cookies recommended).
- Hash passwords with bcrypt; never store plaintext passwords.
- Rotate and protect JWT secrets.

## License
MIT