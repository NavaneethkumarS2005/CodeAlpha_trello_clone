# ProjectSync - Full Stack Trello Clone 🚀

A full-stack collaborative project management tool built with the **MERN** stack (MongoDB, Express, React, Node.js). ProjectSync allows users to create group projects, manage tasks via a drag-and-drop Kanban board, assign tasks, and communicate through comments.

## ✨ Features

- **User Authentication:** Secure JWT-based registration and login with bcrypt password hashing.
- **Project Management:** Create and manage distinct project boards.
- **Interactive Kanban Board:** Drag-and-drop tasks across "To Do", "In Progress", and "Done" columns using `@hello-pangea/dnd`.
- **Task Assignment:** Assign specific tasks to project members.
- **Activity & Comments:** Real-time comment threads on every task card.
- **Premium UI:** Custom dark-mode design using Vanilla CSS Variables, responsive layouts, and glassmorphism.

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite), React Router, `@hello-pangea/dnd` (Drag & Drop), Axios.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB, Mongoose.
- **Authentication:** JSON Web Tokens (JWT), bcrypt.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- Node.js installed
- MongoDB installed locally or a free MongoDB Atlas Cluster.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NavaneethkumarS2005/CodeAlpha_trello_clone.git
   cd CodeAlpha_trello_clone
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
   Start the backend server:
   ```bash
   node server.js
   ```

3. **Frontend Setup**
   Open a new terminal window:
   ```bash
   cd client
   npm install
   ```
   Start the development server:
   ```bash
   npm run dev
   ```

4. **Open the Application**
   Navigate to `http://localhost:5173` in your browser.

## 📂 Folder Structure

```text
├── client/
│   ├── src/
│   │   ├── components/  # Reusable UI components (Navbar, Modals, TaskCards)
│   │   ├── context/     # React Context for global Auth state
│   │   ├── pages/       # Route pages (Login, Register, Dashboard, Board)
│   │   ├── services/    # Axios API instance with interceptors
│   │   └── index.css    # Premium dark mode design system
├── server/
│   ├── controllers/     # API route logic (auth, projects, tasks, comments)
│   ├── middleware/      # JWT verification middleware
│   ├── models/          # Mongoose DB Schemas
│   ├── routes/          # Express route definitions
│   └── server.js        # Entry point for backend
```

## 📜 License

Distributed under the MIT License.
