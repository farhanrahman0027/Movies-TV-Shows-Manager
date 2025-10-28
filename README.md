# Movies & TV Shows Manager

A full-stack web application for managing your favorite movies and TV shows with user authentication. Built with React + Vite + TypeScript frontend and Express + MySQL backend.

## Features

- **User Authentication**: Sign up and login with email/password using JWT tokens
- **Movie Management**: Add, edit, and delete movies and TV shows
- **Infinite Scroll**: Automatically load more entries as you scroll down
- **Responsive Design**: Works on desktop and mobile devices
- **Data Persistence**: All data stored in MySQL database with user isolation
- **Type-Safe**: Full TypeScript support for both frontend and backend

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4
- **Backend**: Express.js, Node.js
- **Database**: MySQL
- **Authentication**: JWT tokens with bcryptjs password hashing
- **Validation**: Zod for schema validation

## Prerequisites

- Node.js 18+ and npm
- MySQL database (local or cloud-hosted)

## Setup Instructions

### 1. Clone and Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

\`\`\`
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=movies_db
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3001
FRONTEND_URL=http://localhost:5173
\`\`\`

Create a `server/.env` file with the same database configuration:

\`\`\`
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=movies_db
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3001
FRONTEND_URL=http://localhost:5173
\`\`\`

### 3. Create Database and Tables

Run the SQL migration script to set up your database:

\`\`\`bash
mysql -u root -p < scripts/01-init-schema.sql
\`\`\`

Or manually run the SQL commands in your MySQL client.

### 4. Run Development Servers

**Option 1: Run both frontend and backend together**

\`\`\`bash
npm run dev:all
\`\`\`

**Option 2: Run separately in different terminals**

Terminal 1 - Frontend (Vite):
\`\`\`bash
npm run dev
\`\`\`

Terminal 2 - Backend (Express):
\`\`\`bash
npm run server
\`\`\`

The frontend will be available at `http://localhost:5173`
The backend API will be available at `http://localhost:5000`

## Usage

1. **Sign Up**: Create a new account with your email and password
2. **Login**: Sign in with your credentials
3. **Add Entry**: Click "+ Add Entry" to add a new movie or TV show
4. **Edit Entry**: Click the edit icon on any entry to modify it
5. **Delete Entry**: Click the delete icon to remove an entry (with confirmation)
6. **Infinite Scroll**: Scroll down to automatically load more entries
7. **Logout**: Click the logout button to sign out

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
  - Body: `{ email: string, password: string }`
  - Returns: `{ token: string, user: { id: number, email: string } }`

- `POST /api/auth/login` - Login with email and password
  - Body: `{ email: string, password: string }`
  - Returns: `{ token: string, user: { id: number, email: string } }`

### Movies (All require Authorization header with JWT token)
- `GET /api/movies?page=1&limit=10` - Get paginated list of movies
  - Returns: `{ movies: Movie[], hasMore: boolean, total: number }`

- `POST /api/movies` - Create a new movie entry
  - Body: `{ title, type, director, budget, location, duration, year_time, poster_url }`
  - Returns: `{ id, title, type, director, budget, location, duration, year_time, poster_url }`

- `PUT /api/movies/:id` - Update a movie entry
  - Body: `{ title, type, director, budget, location, duration, year_time, poster_url }`
  - Returns: Updated movie object

- `DELETE /api/movies/:id` - Delete a movie entry
  - Returns: `{ success: true }`

## Project Structure

\`\`\`
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Label.tsx
│   │   ├── Dialog.tsx
│   │   ├── AlertDialog.tsx
│   │   ├── MovieForm.tsx
│   │   ├── MovieTable.tsx
│   │   ├── DeleteConfirmDialog.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   └── HomePage.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server/
│   ├── index.js
│   └── .env.example
├── scripts/
│   └── 01-init-schema.sql
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── package.json
└── README.md
\`\`\`

## Deployment

### Deploy Frontend to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and select your repository
4. Set the build command to `npm run build`
5. Set the output directory to `dist`
6. Add environment variables if needed
7. Click "Deploy"

### Deploy Backend to Heroku/Railway

1. Create a new project on Heroku or Railway
2. Connect your GitHub repository
3. Add environment variables:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`
4. Set the start command to `node server/index.js`
5. Deploy

## Troubleshooting

### Database Connection Error
- Verify your MySQL server is running
- Check that environment variables are correctly set in `.env` and `server/.env`
- Ensure the database and tables exist by running the SQL script
- Verify the database user has proper permissions

### Authentication Issues
- Clear browser localStorage and try logging in again
- Check that the users table exists in your database
- Verify JWT_SECRET is set in the backend environment variables
- Check browser console for error messages

### API Errors
- Ensure the backend server is running on port 3001
- Check that the Authorization header is being sent with JWT token
- Review server logs for detailed error information
- Verify all required fields are provided when creating/updating entries

### CORS Issues
- Ensure CORS is enabled in the Express backend
- Check that FRONTEND_URL environment variable is set correctly
- Verify the frontend is making requests to the correct API URL

## Development Tips

- Use `npm run dev:all` to run both frontend and backend simultaneously
- Frontend hot-reloads on file changes
- Backend requires manual restart on file changes (consider using nodemon for development)
- Check browser DevTools Network tab to debug API calls
- Use MySQL Workbench or similar tools to inspect database directly

## License

MIT
"# Movies-TV-Shows-Manager" 
