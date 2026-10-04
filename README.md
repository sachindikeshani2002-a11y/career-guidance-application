# CareerPath

A Career Guidance and Skill Development web application
built as a university project.

## Features

- Student registration and login
- JWT authentication
- Student profiles with interests and skills
- Career paths and required skills
- Course enrollment
- Learning progress tracking

## Technologies

- Frontend: React and Vite
- Backend: Node.js and Express
- Database: MongoDB
- Authentication: JWT and bcryptjs

## Requirements

- Node.js and npm
- MongoDB Community Server running locally

## Backend Setup

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside `backend`:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/career_guidance_db
JWT_SECRET=replace_with_a_random_secret
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into `JWT_SECRET`.

Add sample data:

```bash
node scripts/seedCareers.js
node scripts/seedCourses.js
```

Start the backend:

```bash
npm run dev
```

Backend address: http://localhost:5001

## Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev -- --port 5173 --strictPort
```

Open http://localhost:5173 in your browser.

Keep both terminals running.

## Usage

1. Register a student account.
2. Log in.
3. Update your profile.
4. Explore career paths.
5. Enroll in a course.
6. View My Progress and mark a course as completed.

Course completion is currently recorded by the student.

## Configuration

The frontend uses backend port 5001.
The backend allows frontend origin http://localhost:5173.

Local `.env` files are excluded from Git.
Database records are not included in this repository.