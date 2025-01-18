# Post API Documentation

## Overview

The Post API provides endpoints for managing social posts in the system. These endpoints support creating, retrieving, updating, and managing posts, with features for likes and comments. Posts can include text content and media attachments.

## Table of Contents

### Protected Endpoints

- [Create Post](#create-post)
- [Get All Posts](#get-all-posts)
- [Get Post by ID](#get-post-by-id)
- [Update Post](#update-post)
- [Delete Post](#delete-post)
- [Like Post](#like-post)
- [Get User Posts](#get-user-posts)
- [Get My Posts](#get-my-posts)

## Endpoints

### Create Post

Creates a new post.

```
POST /api/posts
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "content": "Having a great time with fellow soldiers!",
  "media": ["image1.jpg", "image2.jpg"]
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "post": {
      "_id": "507f1f77bcf86cd799439011",
      "authorId": "507f1f77bcf86cd799439012",
      "content": "Having a great time with fellow soldiers!",
      "media": ["image1.jpg", "image2.jpg"],
      "likes": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get All Posts

Retrieves all posts with optional filtering.

```
GET /api/posts
```

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sort`: Sort order ("newest" or "popular", default: "newest")

#### Success Response

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "author": {
          "_id": "507f1f77bcf86cd799439012",
          "firstName": "John",
          "lastName": "Doe"
        },
        "content": "Having a great time with fellow soldiers!",
        "media": ["image1.jpg", "image2.jpg"],
        "likes": ["507f1f77bcf86cd799439013"],
        "commentsCount": 5,
        "likesCount": 1,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "totalPages": 3
  }
}
```

### Get Post by ID

Retrieves detailed information about a specific post.

```
GET /api/posts/:postId
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "post": {
      "_id": "507f1f77bcf86cd799439011",
      "author": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "John",
        "lastName": "Doe",
        "profileImage": "profile.jpg"
      },
      "content": "Having a great time with fellow soldiers!",
      "media": ["image1.jpg", "image2.jpg"],
      "likes": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "firstName": "Jane",
          "lastName": "Smith"
        }
      ],
      "comments": [
        {
          "_id": "507f1f77bcf86cd799439014",
          "author": {
            "_id": "507f1f77bcf86cd799439013",
            "firstName": "Jane",
            "lastName": "Smith"
          },
          "content": "Looks amazing!",
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Post

Updates an existing post (author only).

```
PUT /api/posts/:postId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "content": "Updated post content",
  "media": ["newimage1.jpg"]
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Post updated successfully",
    "post": {
      "_id": "507f1f77bcf86cd799439011",
      "content": "Updated post content",
      "media": ["newimage1.jpg"]
    }
  }
}
```

### Delete Post

Deletes a post (author or admin only).

```
DELETE /api/posts/:postId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Post deleted successfully"
  }
}
```

### Like Post

Toggles like status on a post.

```
POST /api/posts/:postId/like
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

### Get User Posts

Retrieves all posts by a specific user.

```
GET /api/posts/user/:userId
```

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sort`: Sort order ("newest" or "popular", default: "newest")

#### Success Response

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "content": "Having a great time with fellow soldiers!",
        "media": ["image1.jpg", "image2.jpg"],
        "commentsCount": 5,
        "likesCount": 1,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "totalPages": 1
  }
}
```

### Get My Posts

Retrieves all posts by the authenticated user.

```
GET /api/posts/my
```

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sort`: Sort order ("newest" or "popular", default: "newest")

#### Success Response

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "content": "Having a great time with fellow soldiers!",
        "media": ["image1.jpg", "image2.jpg"],
        "commentsCount": 5,
        "likesCount": 1,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "totalPages": 1
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
  "error": "Unauthorized - Must be post author"
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "Post not found"
}
```

### Validation Error

```json
{
  "success": false,
  "error": "Invalid post data provided"
}
```

### Media Error

```json
{
  "success": false,
  "error": "Maximum media limit exceeded"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```
