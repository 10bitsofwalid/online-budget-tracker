# Online Budget Tracker

A full-stack expense tracking web app. Users register, log in, and manage personal expenses through a simple dashboard. Built with Express and MongoDB, deployable on Vercel as serverless functions.

## Features

- User registration and login with hashed passwords (`bcryptjs`)
- Cookie-based session auth (`cookie`, `cookie-session`)
- Create, read, update, and delete expenses
- Per-user data isolation (expenses scoped to logged-in `user_id`)
- Static dashboard, login, register, and edit-expense pages
- Works locally via Express or deployed as Vercel serverless functions

## Tech Stack

- **Backend:** Node.js, Express 5
- **Database:** MongoDB (official `mongodb` driver)
- **Auth:** bcryptjs, cookie-based sessions
- **Frontend:** Static HTML/CSS/JS (`public/`)
- **Deployment:** Vercel (`vercel.json`)

## Project Structure

```
├── api/
│   ├── _db.js          # MongoDB client connection
│   ├── auth.js         # login / register / logout / session check
│   └── expenses.js     # CRUD for expenses
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── edit_expense.html
│   └── assets/
├── server.js            # Express entry point (local dev)
├── vercel.json           # Vercel routing config
└── package.json
```

## Getting Started

### Prerequisites

- Node.js
- A MongoDB instance (local or Atlas)

### Installation

```bash
git clone https://github.com/10bitsofwalid/online-budget-tracker.git
cd online-budget-tracker
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
MONGO_URI=your_mongodb_connection_string
DB_NAME=budget_tracker
NODE_ENV=development
PORT=3000
```

### Run Locally

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## API Reference

### Auth — `/api/auth`

| Method | Query           | Body                          | Description         |
|--------|-----------------|--------------------------------|----------------------|
| POST   | `?action=register` | `{ name, email, password }` | Create new user      |
| POST   | `?action=login`    | `{ email, password }`       | Log in, sets session cookie |
| POST   | `?action=logout`   | —                            | Clears session cookie |
| GET    | `?action=check`    | —                            | Returns current session status |

### Expenses — `/api/expenses` (requires session cookie)

| Method | Query      | Body                                      | Description              |
|--------|-----------|---------------------------------------------|----------------------------|
| GET    | —          | —                                          | List all expenses for user |
| GET    | `?id=`    | —                                          | Get single expense         |
| POST   | —          | `{ title, amount, category, date }`       | Create expense              |
| PUT    | `?id=`    | `{ title, amount, category, date }`       | Update expense              |
| DELETE | `?id=`    | —                                          | Delete expense              |

## Deployment

Configured for Vercel out of the box (`vercel.json` routes `/api/*` requests to serverless functions). Push to a connected Vercel project, or:

```bash
vercel deploy
```

Make sure `MONGO_URI` and `DB_NAME` are set in the Vercel project's environment variables.

# 👨‍💻 Author

**Walid Rahman**

* GitHub: <https://github.com/10bitsofwalid>

* Portfolio: <https://walid-rahman-portfolio.vercel.app>

* LinkedIn: <https://www.linkedin.com/in/mohammad-walid-rahman>

## License

ISC
