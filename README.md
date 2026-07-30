# MediaShelf - Movie & Book Library Web Application

MediaShelf is a complete full-stack Movie & Book Library MERN application built with modern premium aesthetics, featuring persistent Light/Dark themes, advanced search capabilities, server-side filtering, sorting, pagination, and visual database analytics.

---

## 🚀 Key Features

* **Dual Persistent Themes**: Choice of Light Mode (modern gray/white tones with blue gradients) and Dark Mode (sleek slate background with glassmorphism overlays and purple/blue accents). Selection is persistent across page reloads using Local Storage.
* **Dashboard Analytics**: Real-time summary statistics cards (Total Movies, Books, Average Rating, Favorites) and interactive charts (Donut chart for ratio, Bar chart for top genres) powered by **Recharts**.
* **Unified Library Catalog**: Responsive card grids featuring posters with custom styled CSS gradient fallbacks. Includes view details modals, in-place edit forms, quick favorite toggle, and delete confirmations.
* **Mongoose REST API**: Standardized endpoints with robust server-side query processing using:
  * Fuzzy regex searches (checks titles, genres, and directors/authors).
  * Multi-filtering criteria (type, genre, rating, release year).
  * Standardized sort parameters (Newest, Oldest, Rating High/Low, Title A-Z/Z-A).
  * Server-side pagination matching database indexes.
* **JSON Export & Import**: Ability to backup your catalog as clean schema-aligned JSON files, and restore backups with automatic duplicate checks.
* **Keyboard Navigation Shortcut**: Pressing `/` instantly focuses the search input bar.
* **Responsive Layouts**: Fully responsive grid matching desktop, tablet, and mobile dimensions.

---

## 🛠 Tech Stack

### Frontend
* **React 19** + **Vite** (Next-gen bundling)
* **React Router Dom** (Single-page app routing)
* **Tailwind CSS** (Modern styling system)
* **Axios** (REST client integration)
* **React Icons** (SVG library)
* **React Hot Toast** (Reactive toast alerts)
* **Recharts** (Interactive charting components)

### Backend & Database
* **Node.js** + **Express.js** (Server layer)
* **MongoDB** (NoSQL Document Store)
* **Mongoose** (MongoDB Schema mapping and validation)

---

## 📦 Directory Structure

```
movie-book-library/
├── package.json         # Root scripts (running concurrent dev environments)
├── server/
│   ├── package.json     # Backend node package manifest
│   ├── .env             # Backend environment settings
│   ├── server.js        # Bootstraps Express and DB
│   ├── config/          # DB config scripts
│   ├── controllers/     # Controller CRUD functions
│   ├── models/          # Mongoose LibraryItem schema
│   ├── routes/          # Express route bindings
│   └── utils/           # Server validators
└── client/
    ├── package.json     # Frontend manifest
    ├── index.html       # Vite HTML layout
    ├── vite.config.js   # Vite configuration (proxies /api requests)
    └── src/
        ├── index.css    # Custom scrollbar, glassmorphic styling
        ├── main.jsx     # Vite React Entry Point
        ├── App.jsx      # Core Routes & App content
        ├── context/     # Theme Context Provider
        ├── hooks/       # Custom keyboard listeners
        ├── services/    # Axios HTTP methods
        ├── pages/       # Dashboard, Catalog, Creation views
        └── components/  # Cards, Modals, Pagination layout
```

---

## ⚙️ Installation & Configuration

### Prerequisites
* [Node.js](https://nodejs.org) (v18 or higher recommended)
* [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on default port `27017`

### Step 1: Install Dependencies
Run the install command from the root directory to automatically resolve packages in the root, server, and client environments:
```bash
npm run install-all
```

### Step 2: Configure Environment Variables
A default `.env` is already configured for the server at `server/.env`.
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/movie_book_library
NODE_ENV=development
```

---

## 🏃 Running the Application

To run both the **Express Backend** (Port 5000) and the **Vite Frontend** (Port 3000) concurrently in development mode, run:
```bash
npm run dev
```

Visit the frontend client at: **[http://localhost:3000](http://localhost:3000)**.
The API endpoints are served at: **[http://localhost:5000](http://localhost:5000)**.

---

## 📝 REST API Documentation

| HTTP Method | Endpoint | Description | Query Parameters |
|:---|:---|:---|:---|
| **GET** | `/api/items` | Retrieves paginated items | `search`, `type`, `genre`, `rating`, `year`, `sort`, `page`, `limit` |
| **GET** | `/api/items/:id` | Fetches a single item by id | None |
| **POST** | `/api/items` | Creates a movie or book | None |
| **PUT** | `/api/items/:id` | Updates a movie or book | None |
| **DELETE** | `/api/items/:id` | Removes an item by id | None |
| **GET** | `/api/items/stats` | Fetches Dashboard Metrics | None |
| **POST** | `/api/items/import` | Imports array of JSON items | None |

---

## 📚 Example JSON Import Format

You can import media in bulk by uploading a `.json` file from the **Library** page. The format must match the following array schema:

```json
[
  {
    "type": "Movie",
    "title": "Interstellar",
    "genre": "Sci-Fi",
    "authorOrDirector": "Christopher Nolan",
    "rating": 5,
    "releaseYear": 2014,
    "description": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    "posterUrl": "https://images.unsplash.com/photo-1534447677768-be436bb09401",
    "favorite": true
  },
  {
    "type": "Book",
    "title": "The Hobbit",
    "genre": "Fantasy",
    "authorOrDirector": "J.R.R. Tolkien",
    "rating": 5,
    "releaseYear": 1937,
    "description": "A reluctant Hobbit, Bilbo Baggins, sets out to the Lonely Mountain with a spirited group of dwarves.",
    "posterUrl": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e",
    "favorite": false
  }
]
```
