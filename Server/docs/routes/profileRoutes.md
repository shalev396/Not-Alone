# Profile API Documentation

## Overview

The Profile API provides endpoints for managing user profiles in the system. These endpoints support creating, retrieving, and updating user profiles, including personal information, preferences, and profile images.

## Table of Contents

### Protected Endpoints

- [Get My Profile](#get-my-profile)
- [Update My Profile](#update-my-profile)
- [Get Profile by User ID](#get-profile-by-user-id)
- [Update User Profile](#update-user-profile)
- [Update Last Active](#update-last-active)

## Endpoints

### Get My Profile

Retrieves the profile of the authenticated user.

```
GET /api/profiles/me
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "profile": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "nickname": "JohnD",
      "bio": "Proud soldier serving in Tel Aviv",
      "profileImage": "profile.jpg",
      "visibility": "public",
      "lastActive": "2024-01-01T00:00:00.000Z",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "type": "soldier"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update My Profile

Updates the profile of the authenticated user.

```
PUT /api/profiles/me
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "nickname": "JohnDoe123",
  "bio": "Updated bio information",
  "profileImage": "newprofile.jpg",
  "visibility": "private"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Profile updated successfully",
    "profile": {
      "_id": "507f1f77bcf86cd799439011",
      "nickname": "JohnDoe123",
      "bio": "Updated bio information",
      "profileImage": "newprofile.jpg",
      "visibility": "private",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Profile by User ID

Retrieves a user's profile by their user ID.

```
GET /api/profiles/:userId
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "profile": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "nickname": "JohnD",
      "bio": "Proud soldier serving in Tel Aviv",
      "profileImage": "profile.jpg",
      "visibility": "public",
      "lastActive": "2024-01-01T00:00:00.000Z",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "type": "soldier"
      }
    }
  }
}
```

### Update User Profile

Updates a user's profile (Admin only).

```
PUT /api/profiles/:userId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "nickname": "NewNickname",
  "bio": "Admin updated bio",
  "visibility": "public"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Profile updated successfully",
    "profile": {
      "_id": "507f1f77bcf86cd799439011",
      "nickname": "NewNickname",
      "bio": "Admin updated bio",
      "visibility": "public",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Last Active

Updates the last active timestamp for the authenticated user's profile.

```
POST /api/profiles/last-active
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Last active timestamp updated",
    "lastActive": "2024-01-01T00:00:00.000Z"
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
  "error": "Unauthorized - Admin access required"
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "Profile not found"
}
```

### Validation Error

```json
{
  "success": false,
  "error": "Invalid profile data provided"
}
```

### Visibility Error

```json
{
  "success": false,
  "error": "Profile is private"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```
