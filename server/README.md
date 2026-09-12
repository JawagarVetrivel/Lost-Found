# Campus Lost & Found – Backend API Documentation

A modern REST API powered by Node.js, Express, Supabase (PostgreSQL, Auth, Storage), and Google Gemini AI for Smart Matching.

---

## Base URL
```
http://localhost:5000/api
```

---

## Response Format

All responses strictly follow standard JSON structures:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Detailed error description",
    "code": "ERROR_CODE"
  }
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Authentication:** None (Public)
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "studentId": "STU10293",
    "email": "student@university.edu",
    "password": "password123",
    "role": "student"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "u_123",
        "name": "Jane Doe",
        "studentId": "STU10293",
        "email": "student@university.edu",
        "role": "student"
      }
    }
  }
  ```
- **Errors:** `400 VALIDATION_ERROR`, `400 REGISTRATION_FAILED`

### 1.2 Login User
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Authentication:** None (Public)
- **Request Body:**
  ```json
  {
    "email": "student@university.edu",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "u_123",
        "name": "Jane Doe",
        "studentId": "STU10293",
        "email": "student@university.edu",
        "role": "student"
      }
    }
  }
  ```
- **Errors:** `401 INVALID_CREDENTIALS`

### 1.3 Get Current User Profile
- **Method:** `GET`
- **URL:** `/api/auth/me`
- **Authentication:** Required (`Bearer <token>`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "u_123",
      "name": "Jane Doe",
      "studentId": "STU10293",
      "email": "student@university.edu",
      "role": "student"
    }
  }
  ```
- **Errors:** `401 UNAUTHORIZED`

### 1.4 Logout
- **Method:** `POST`
- **URL:** `/api/auth/logout`
- **Authentication:** Required (`Bearer <token>`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "message": "Logged out successfully"
    }
  }
  ```

### 1.5 Password Reset
- **Method:** `POST`
- **URL:** `/api/auth/reset-password`
- **Authentication:** None (Public)
- **Request Body:**
  ```json
  {
    "email": "student@university.edu"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "message": "Password reset instructions have been sent to your email address."
    }
  }
  ```

---

## 2. Item Endpoints (`/api/items`)

### 2.1 Report Lost Item
- **Method:** `POST`
- **URL:** `/api/items/lost`
- **Authentication:** Required (`Bearer <token>`)
- **Request Body:**
  ```json
  {
    "title": "Apple AirPods Pro",
    "category": "Electronics",
    "description": "White AirPods Pro in a clear case with small scratch on left earbud",
    "brand": "Apple",
    "color": "White",
    "date": "2026-09-12",
    "time": "14:30",
    "location": "Library",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "imageUrl": "https://.../airpods.jpg"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "i_123",
      "userId": "u_123",
      "type": "lost",
      "title": "Apple AirPods Pro",
      "category": "Electronics",
      "description": "White AirPods Pro in a clear case...",
      "brand": "Apple",
      "color": "White",
      "date": "2026-09-12",
      "time": "14:30",
      "location": "Library",
      "imageUrl": "https://.../airpods.jpg",
      "status": "active",
      "createdAt": "2026-09-12T14:35:00.000Z"
    }
  }
  ```
- *Note:* Automatically executes the **Smart Matching Engine** against unresolved found items and notifies users when high-confidence matches are found.

### 2.2 Report Found Item
- **Method:** `POST`
- **URL:** `/api/items/found`
- **Authentication:** Required (`Bearer <token>`)
- **Request Body:** Same fields as Report Lost Item.
- **Response (201 Created):** Item entity with `type: "found"`.

### 2.3 Browse Items
- **Method:** `GET`
- **URL:** `/api/items`
- **Authentication:** Optional
- **Query Parameters:**
  - `search`: Full-text query on title, description, or brand
  - `category`: Filter by category (e.g. `Electronics`, `Bags`, etc.)
  - `location`: Filter by campus location (e.g. `Library`, `Cafeteria`)
  - `type`: Filter by type (`lost` or `found`)
  - `date`: Filter by report date (`YYYY-MM-DD`)
  - `status`: Filter by status (`active`, `resolved`, `claimed`)
  - `userId`: Filter by reporting user ID
  - `page`: Page index (default `1`)
  - `limit`: Items per page (default `50`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "i_123",
        "userId": "u_123",
        "type": "lost",
        "title": "Apple AirPods Pro",
        "category": "Electronics",
        "description": "...",
        "brand": "Apple",
        "color": "White",
        "date": "2026-09-12",
        "time": "14:30",
        "location": "Library",
        "imageUrl": "https://...",
        "status": "active",
        "createdAt": "2026-09-12T14:35:00.000Z"
      }
    ]
  }
  ```

### 2.4 Get Item by ID
- **Method:** `GET`
- **URL:** `/api/items/:id`
- **Authentication:** Optional
- **Response (200 OK):** Single item object
- **Errors:** `404 NOT_FOUND`

### 2.5 Update Item
- **Method:** `PUT`
- **URL:** `/api/items/:id`
- **Authentication:** Required (Must be report owner or admin)
- **Request Body:** Partial item fields (`title`, `description`, `location`, `color`, etc.)
- **Response (200 OK):** Updated item object
- **Errors:** `403 FORBIDDEN`, `404 NOT_FOUND`

### 2.6 Delete Item
- **Method:** `DELETE`
- **URL:** `/api/items/:id`
- **Authentication:** Required (Must be report owner or admin)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": { "message": "Item deleted successfully" }
  }
  ```
- **Errors:** `403 FORBIDDEN`, `404 NOT_FOUND`

### 2.7 Update Item Status
- **Method:** `PATCH`
- **URL:** `/api/items/:id/status`
- **Authentication:** Required (Must be report owner or admin)
- **Request Body:**
  ```json
  {
    "status": "resolved"
  }
  ```
- **Response (200 OK):** Updated item object

---

## 3. Image Upload (`/api/upload`)

### 3.1 Upload Image
- **Method:** `POST`
- **URL:** `/api/upload`
- **Authentication:** Required (`Bearer <token>`)
- **Headers:** `Content-Type: multipart/form-data`
- **Form Data Field:** `image` (binary file, maximum 5MB, format: PNG, JPG, JPEG, or WebP)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "url": "https://...supabase.co/storage/v1/object/public/items/uploads/...",
      "path": "uploads/169...",
      "size": 240182,
      "mimetype": "image/jpeg"
    }
  }
  ```
- **Errors:** `400 INVALID_FILE_TYPE`, `400 FILE_TOO_LARGE`

---

## 4. Smart Matches (`/api/matches`)

### 4.1 Get User Matches
- **Method:** `GET`
- **URL:** `/api/matches`
- **Authentication:** Required (`Bearer <token>`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "m_1",
        "lostItemId": "i_1",
        "foundItemId": "i_2",
        "categoryScore": 100,
        "locationScore": 100,
        "timeScore": 90,
        "descriptionScore": 92,
        "colorScore": 100,
        "brandScore": 100,
        "finalScore": 95,
        "status": "pending",
        "explanation": "Strong match because both reports are for Electronics, were reported near Library within 30 minutes, and have highly similar descriptions.",
        "reasons": [
          "Same category (Electronics)",
          "Exact same campus location (Library)",
          "Reported within 1 hour of each other",
          "Descriptions show very high semantic similarity",
          "Matching color scheme (White)",
          "Matching brand (Apple)"
        ],
        "lostItem": { ... },
        "foundItem": { ... }
      }
    ]
  }
  ```

### 4.2 Get Matches for a Specific Item
- **Method:** `GET`
- **URL:** `/api/items/:id/matches`
- **Authentication:** Required (`Bearer <token>`)
- **Response (200 OK):** List of matches involving the given item.

### 4.3 Dismiss Match
- **Method:** `PATCH`
- **URL:** `/api/matches/:id/dismiss`
- **Authentication:** Required (`Bearer <token>`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": { "message": "Match dismissed successfully" }
  }
  ```

---

## 5. Claim System (`/api/claims`)

### 5.1 Submit Claim
- **Method:** `POST`
- **URL:** `/api/claims`
- **Authentication:** Required (`Bearer <token>`)
- **Request Body:**
  ```json
  {
    "itemId": "i_found_123",
    "message": "This is my lost headphone case. It has my initials etched on the bottom.",
    "proofImageUrl": "https://.../proof.jpg"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "c_123",
      "itemId": "i_found_123",
      "userId": "u_student",
      "message": "...",
      "status": "pending",
      "createdAt": "2026-09-12T15:00:00.000Z"
    }
  }
  ```

### 5.2 Get My Claims
- **Method:** `GET`
- **URL:** `/api/claims/my`
- **Authentication:** Required (`Bearer <token>`)
- **Response (200 OK):** List of claims submitted by the current user.

### 5.3 Review Claim (Approve/Reject)
- **Method:** `PATCH`
- **URL:** `/api/claims/:id`
- **Authentication:** Required (Item Owner or Admin)
- **Request Body:**
  ```json
  {
    "status": "approved"
  }
  ```
- **Response (200 OK):** Updated claim object.
- *Side Effect:* When approved, automatically marks item as `resolved` and notifies the claimer.

---

## 6. Notifications (`/api/notifications`)

### 6.1 Get Notifications
- **Method:** `GET`
- **URL:** `/api/notifications`
- **Authentication:** Required (`Bearer <token>`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "n_1",
        "userId": "u_1",
        "title": "High Confidence Match (95%)",
        "message": "A potential match was found for your lost Apple AirPods Pro!",
        "type": "match",
        "isRead": false,
        "read": false,
        "link": "/matches",
        "createdAt": "2026-09-12T15:00:00.000Z"
      }
    ]
  }
  ```

### 6.2 Mark Notification as Read
- **Method:** `PATCH`
- **URL:** `/api/notifications/:id/read`
- **Authentication:** Required (`Bearer <token>`)
- **Response (200 OK):** Updated notification object.

### 6.3 Mark All Notifications as Read
- **Method:** `PATCH`
- **URL:** `/api/notifications/read-all`
- **Authentication:** Required (`Bearer <token>`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": { "message": "All notifications marked as read" }
  }
  ```

---

## 7. Admin Endpoints (`/api/admin`)
*All admin routes require `role: "admin"`.*

### 7.1 Platform Overview Statistics
- **Method:** `GET`
- **URL:** `/api/admin/stats`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "totalLost": 142,
      "totalFound": 98,
      "resolved": 54,
      "activeMatches": 19
    }
  }
  ```

### 7.2 Manage Users
- **Method:** `GET` `/api/admin/users`
- **Method:** `PATCH` `/api/admin/users/:id` (Change user role or suspend user)

### 7.3 Manage Items & Claims
- **Method:** `GET` `/api/admin/items`
- **Method:** `PATCH` `/api/admin/items/:id`
- **Method:** `GET` `/api/admin/claims`
- **Method:** `PATCH` `/api/admin/claims/:id`
