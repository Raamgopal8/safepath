# SafePath AI Backend

Backend API server for the SafePath AI navigation mobile app built with Node.js, Express.js, and MongoDB.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

## Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the backend directory:
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/safepath
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

4. Start MongoDB (if running locally)

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Or start the production server:
   ```bash
   npm start
   ```

The server will run on `http://localhost:3000` by default.

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Access:** Public

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "healthProfile": "Asthma",
  "sensitivity": "High"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "username": "johndoe",
  "email": "john@example.com",
  "healthProfile": "Asthma",
  "sensitivity": "High",
  "token": "jwt_token_here"
}
```

#### Login User
- **POST** `/api/auth/login`
- **Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "username": "johndoe",
  "email": "john@example.com",
  "healthProfile": "Asthma",
  "sensitivity": "High",
  "token": "jwt_token_here"
}
```

#### Get Current User
- **GET** `/api/auth/me`
- **Access:** Private (requires Bearer token)

**Headers:**
```
Authorization: Bearer jwt_token_here
```

### Routes

#### Save Route History
- **POST** `/api/routes/save`
- **Access:** Private

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "origin": "12.9716,77.5946",
  "destination": "13.0827,80.2707",
  "selectedRoute": {
    "id": 1,
    "distance": "2.5 km",
    "duration": "15 min",
    "healthScore": 85
  },
  "environmentalScore": 85
}
```

#### Get Route History
- **GET** `/api/routes/history?page=1&limit=10`
- **Access:** Private

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

#### Get Route Statistics
- **GET** `/api/routes/stats`
- **Access:** Private

**Headers:**
```
Authorization: Bearer jwt_token_here
```

## Postman Collection

### Authentication Requests

#### Register
```
Method: POST
URL: http://localhost:3000/api/auth/register
Body (raw JSON):
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "testpass123",
  "healthProfile": "Normal",
  "sensitivity": "Low"
}
```

#### Login
```
Method: POST
URL: http://localhost:3000/api/auth/login
Body (raw JSON):
{
  "email": "test@example.com",
  "password": "testpass123"
}
```

Copy the token from the login response for authenticated requests.

#### Get Profile
```
Method: GET
URL: http://localhost:3000/api/auth/me
Headers:
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### Route Requests

#### Save Route
```
Method: POST
URL: http://localhost:3000/api/routes/save
Headers:
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Body (raw JSON):
{
  "origin": "40.7128,-74.0060",
  "destination": "40.7589,-73.9851",
  "selectedRoute": {
    "id": 1,
    "distance": "3.2 km",
    "duration": "18 min",
    "healthScore": 78
  },
  "environmentalScore": 78
}
```

#### Get Route History
```
Method: GET
URL: http://localhost:3000/api/routes/history?page=1&limit=5
Headers:
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

#### Get Route Stats
```
Method: GET
URL: http://localhost:3000/api/routes/stats
Headers:
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

## Project Structure

```
backend/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   └── routeController.js    # Route management logic
├── middleware/
│   └── authMiddleware.js     # JWT authentication middleware
├── models/
│   ├── User.js              # User schema
│   └── RouteHistory.js      # Route history schema
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   └── routeRoutes.js       # Route routes
├── .env                     # Environment variables
├── server.js                # Main server file
└── package.json             # Dependencies
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Input validation
- CORS enabled
- Error logging

## Development

- Use `npm run dev` for development with nodemon
- MongoDB should be running locally or provide cloud URI
- JWT tokens expire after 30 days
- Passwords are hashed with salt rounds of 12