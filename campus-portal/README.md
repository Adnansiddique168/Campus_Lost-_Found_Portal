# Campus Lost & Found Portal

This is a modern web application designed as a campus lost and found system. 

## Technology Stack
- **Language**: TypeScript & JavaScript
- **Frontend**: React.js with Next.js (App Router)
- **Styling**: Tailwind CSS
- **Backend / Server**: Next.js (Server Components / API Routes)
- **Database ORM**: Prisma ORM
- **Database**: SQLite (`dev.db` stored locally)

## How to Run the Code

### 1. Install Dependencies
Before running the code, open your terminal (Command Prompt or PowerShell), make sure you are in the `campus-portal` directory, and install the required modules by running:
```bash
npm install
```

### 2. Setup the Database
This project uses Prisma with a local SQLite database. After installing dependencies, set up the database by running:
```bash
npx prisma db push
```
*(This command syncs your `prisma/schema.prisma` file with your SQLite database).*

### 3. Start the Development Server
Once all dependencies are installed and the database is ready, start the server by running:
```bash
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000) in your web browser to view the application.
