# CRM Lead Management System

This is a full-stack CRM built for the TorchLabs assignment. It's a simple tool for sales teams to track leads, manage a pipeline, and keep notes on their deals.

## Tech Stack
I decided to go with a decoupled architecture using **Next.js** for the frontend and **Express** for the backend. 
- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, Lucide Icons.
- **Backend**: Node.js + Express.
- **Database**: PostgreSQL (running in Docker).
- **Auth**: JWT-based authentication.

## Features
- **Auth**: Proper login system. The app is protected, so you can't see the dashboard or leads without logging in.
- **Lead Management**: Full CRUD support. You can create, edit, view, and delete leads.
- **Assignment**: You can assign leads to different sales reps.
- **Pipeline**: A Kanban-style board to see where everyone is in the sales process.
- **Dashboard**: A quick look at the numbers (total leads, win rate, total deal value, etc.).
- **Notes**: A timeline for each lead where you can add internal updates.
- **Search/Filters**: You can search by name or filter by status/source/salesperson.
- **Bonus**: I added a basic **Lead Scoring** system and a **CSV Export** button.

## How to run it locally

### 1. Environment Variables
Create a `.env` file in the `server` directory with the following content:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/nexus_crm?schema=public"
JWT_SECRET="your-secret-key"
PORT=5000
```

### 2. Database
The database runs in Docker. 
```bash
cd server
docker-compose up -d
node init-db.js # This creates the tables and adds some sample data
```

### 2. Run the app
I've set up the main package.json to run both the frontend and backend at once.
```bash
# In the root folder
npm install
npm run dev
```
The app will be at `http://localhost:3000`.

## Test Login
- **Email**: admin@example.com
- **Password**: password123

## Database Details
If you want to look at the raw data using pgAdmin:
- **Host**: localhost
- **Port**: 5433
- **User/Pass**: postgres / postgres
- **DB Name**: nexus_crm

## Reflection
I chose to use **raw SQL** (`pg` driver) instead of an ORM like Prisma or Sequelize. I wanted to show that I understand how to write and optimize queries manually. 
The architecture is decoupled so the backend could easily be used for a mobile app later. 
I spent a good amount of time on the UI to make it feel modern and responsive.

## Known Issues / Limitations
- It's a local demo, so it's not set up for production (JWT secret is in the code).
- No real-time updates (you need to refresh to see changes from other users).

## Demo Video
https://youtu.be/MPpD0_z7hWI?si=Scc9WThb31bv9l4O
