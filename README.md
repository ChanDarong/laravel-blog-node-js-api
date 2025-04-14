# Node.js Blog API

A RESTful API for a blog platform built with Node.js, Express, and MongoDB. This API provides functionality similar to a Laravel blog backend.

## Features

- Post management (CRUD operations)
- Category management
- Search functionality
- Simple and clean API structure

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd laravel-blog
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=your_mongodb_connection_string
DATABASE_NAME=your_database_name
PORT=3000
API_VERSION=v1
NODE_ENV=development
```

## Running the Application

### Development mode
```bash
npm run dev
```

### Production mode
```bash
npm start
```

## API Endpoints

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/posts | Get all posts |
| GET | /api/v1/posts/:id | Get post by ID |
| GET | /api/v1/posts/category/:categoryId | Get posts by category |
| GET | /api/v1/posts/search?query=keyword | Search posts |
| POST | /api/v1/posts | Create a new post |
| PUT | /api/v1/posts/:id | Update a post |
| DELETE | /api/v1/posts/:id | Delete a post |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/categories | Get all categories |
| GET | /api/v1/categories/:id | Get category by ID |
| POST | /api/v1/categories | Create a new category |
| PUT | /api/v1/categories/:id | Update a category |
| DELETE | /api/v1/categories/:id | Delete a category |

## Data Models

### Post
- title (String, required)
- excerpt (String, required)
- author (String, required)
- slug (String, unique, auto-generated from title)
- category (ObjectId reference to Category)
- published (Boolean, default: true)
- featuredImage (String)
- tags (Array of Strings)
- timestamps (createdAt, updatedAt)

### Category
- name (String, required, unique)
- description (String)
- slug (String, unique, auto-generated from name)
- timestamps (createdAt, updatedAt)

## Project Structure

```
.
├── app.js                 # Application entry point
├── package.json           # Project dependencies and scripts
├── .env                   # Environment variables
└── src/
    ├── config/            # Configuration files
    │   └── db.config.js   # Database configuration
    ├── controllers/       # Request handlers
    │   ├── post.controller.js
    │   └── category.controller.js
    ├── models/            # Database models
    │   ├── post.js
    │   └── category.js
    └── routes/            # API routes
        ├── index.js       # Route aggregator
        ├── post.routes.js
        └── category.routes.js
```

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv

## License

ISC

## Note

Generate with AI
