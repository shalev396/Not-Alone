# Comment API Documentation

## Overview

The Comment API provides endpoints for managing comments on posts in the system. These endpoints support creating, retrieving, updating, and deleting comments, as well as managing likes on comments.

## Table of Contents

### Protected Endpoints

- [Create Comment](#create-comment)
- [Get Comments by Post](#get-comments-by-post)
- [Update Comment](#update-comment)
- [Delete Comment](#delete-comment)
- [Toggle Like](#toggle-like)

### Admin Endpoints

- [Get All Comments](#get-all-comments)
- [Get Comment by ID](#get-comment-by-id)

## Endpoints

### Create Comment

Creates a new comment on a post.

```
POST /api/comments
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "postId": "507f1f77bcf86cd799439011",
  "content": "Great post! Thanks for sharing."
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "comment": {
      "_id": "507f1f77bcf86cd799439012",
      "postId": "507f1f77bcf86cd799439011",
      "authorId": "507f1f77bcf86cd799439013",
      "content": "Great post! Thanks for sharing.",
      "likes": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Comments by Post

Retrieves all comments for a specific post.

```
GET /api/comments/post/:postId
```

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sort`: Sort order ("newest" or "oldest", default: "newest")

#### Success Response

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "postId": "507f1f77bcf86cd799439011",
        "author": {
          "_id": "507f1f77bcf86cd799439013",
          "firstName": "John",
          "lastName": "Doe"
        },
        "content": "Great post! Thanks for sharing.",
        "likes": ["507f1f77bcf86cd799439014"],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "totalPages": 2
  }
}
```

### Update Comment

Updates an existing comment (author only).

```
PUT /api/comments/:commentId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "content": "Updated comment content"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "comment": {
      "_id": "507f1f77bcf86cd799439012",
      "content": "Updated comment content",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Delete Comment

Deletes a comment (author or admin only).

```
DELETE /api/comments/:commentId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Comment deleted successfully"
  }
}
```

### Toggle Like

Toggles like status on a comment.

```
POST /api/comments/:commentId/like
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Like toggled successfully",
    "liked": true,
    "likesCount": 5
  }
}
```

### Get All Comments

Retrieves all comments in the system (Admin only).

```
GET /api/comments
```

#### Headers

- `Authorization`: Bearer token (required)

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sort`: Sort order ("newest" or "oldest", default: "newest")

#### Success Response

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "postId": "507f1f77bcf86cd799439011",
        "author": {
          "_id": "507f1f77bcf86cd799439013",
          "firstName": "John",
          "lastName": "Doe"
        },
        "content": "Comment content",
        "likes": ["507f1f77bcf86cd799439014"],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 5
  }
}
```

### Get Comment by ID

Retrieves a specific comment by ID (Admin only).

```
GET /api/comments/:commentId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "comment": {
      "_id": "507f1f77bcf86cd799439012",
      "postId": "507f1f77bcf86cd799439011",
      "author": {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "John",
        "lastName": "Doe"
      },
      "content": "Comment content",
      "likes": ["507f1f77bcf86cd799439014"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Common Error Responses

### Authentication Error

```json
{
  "success": false,
  "error": "No token provided"
}
```

### Authorization Error

```json
{
  "success": false,
  "error": "Unauthorized - Must be comment author"
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "Comment not found"
}
```

### Validation Error

```json
{
  "success": false,
  "error": "Invalid comment data provided"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```
