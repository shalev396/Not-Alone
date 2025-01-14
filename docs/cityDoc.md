# City API Documentation

## Table of Contents

- [Get All Cities](#get-all-cities)
- [Create City](#create-city)
- [Join City as Municipality](#join-city-as-municipality)
- [Join City as Soldier](#join-city-as-soldier)
- [Update City](#update-city)
- [Approve City](#approve-city)
- [Deny City](#deny-city)
- [Delete City](#delete-city)

## Get All Cities

Get a list of all approved cities with basic information (excludes sensitive data like soldiers and municipality users).

**URL**: `/api/cities`

**Method**: `GET`

**Auth required**: No

### Success Response

**Code**: `200 OK`

**Content example**

```json
{
  "cities": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Tel Aviv",
      "zone": "center",
      "bio": "The city that never stops",
      "media": ["https://example.com/image1.jpg"],
      "approvalStatus": "approved"
    }
  ]
}
```

### Error Responses

**Code**: `500 Internal Server Error`

**Content**:

```json
{
  "error": "Error fetching cities"
}
```

## Create City

Create a new city (requires Admin or Municipality user).

**URL**: `/api/cities`

**Method**: `POST`

**Auth required**: Yes (Admin or Municipality)

### Request Body

```json
{
  "name": "Tel Aviv",
  "zone": "center",
  "bio": "The city that never stops",
  "media": ["https://example.com/image1.jpg"]
}
```

### Body Parameters

- `name` (string, required): Name of the city
- `zone` (string, required): One of: "north", "center", "south"
- `bio` (string, required): Description of the city
- `media` (array of strings, optional): URLs of city images

### Success Response

**Code**: `201 Created`

**Content example**

```json
{
  "city": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Tel Aviv",
    "zone": "center",
    "bio": "The city that never stops",
    "media": ["https://example.com/image1.jpg"],
    "soldiers": [],
    "municipalityUsers": [],
    "approvalStatus": "pending",
    "createdAt": "2023-01-01T10:00:00.000Z",
    "updatedAt": "2023-01-01T10:00:00.000Z"
  }
}
```

### Error Responses

**Code**: `400 Bad Request`

- When city name already exists
- When required fields are missing
- When zone is invalid

**Content**:

```json
{
  "error": "City name already exists"
}
```

**Code**: `401 Unauthorized`

- When no authentication token is provided

**Code**: `403 Forbidden`

- When user type is not Admin or Municipality

## Join City as Municipality

Join a city as a municipality user.

**URL**: `/api/cities/:cityId/join/municipality`

**Method**: `POST`

**Auth required**: Yes (Municipality type)

### URL Parameters

- `cityId`: The ID of the city to join

### Success Response

**Code**: `200 OK`

**Content example**

```json
{
  "city": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Tel Aviv",
    "municipalityUsers": ["507f1f77bcf86cd799439013"]
    // ... other city fields
  }
}
```

### Error Responses

**Code**: `400 Bad Request`

- When cityId format is invalid

**Code**: `403 Forbidden`

- When user is not of type Municipality
- When user is already assigned to another city

**Code**: `404 Not Found`

- When city is not found
- When city is not approved

## Join City as Soldier

Join a city as a soldier.

**URL**: `/api/cities/:cityId/join/soldier`

**Method**: `POST`

**Auth required**: Yes (Soldier type)

### URL Parameters

- `cityId`: The ID of the city to join

### Success Response

**Code**: `200 OK`

**Content example**

```json
{
  "city": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Tel Aviv",
    "soldiers": ["507f1f77bcf86cd799439012"]
    // ... other city fields
  }
}
```

### Error Responses

**Code**: `400 Bad Request`

- When cityId format is invalid

**Code**: `403 Forbidden`

- When user is not of type Soldier
- When user is already assigned to another city

**Code**: `404 Not Found`

- When city is not found
- When city is not approved

## Update City

Update city details.

**URL**: `/api/cities/:cityId`

**Method**: `PATCH`

**Auth required**: Yes (Admin or Municipality user in city)

### URL Parameters

- `cityId`: The ID of the city to update

### Request Body

```json
{
  "name": "Updated Tel Aviv",
  "zone": "center",
  "bio": "Updated description",
  "media": ["https://example.com/new-image.jpg"]
}
```

### Body Parameters

- `name` (string, optional): New name for the city
- `zone` (string, optional): One of: "north", "center", "south"
- `bio` (string, optional): New description
- `media` (array of strings, optional): Updated image URLs

### Success Response

**Code**: `200 OK`

**Content example**

```json
{
  "city": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Tel Aviv",
    "zone": "center",
    "bio": "Updated description",
    "media": ["https://example.com/new-image.jpg"]
    // ... other city fields
  }
}
```

### Error Responses

**Code**: `400 Bad Request`

- When cityId format is invalid
- When zone is invalid

**Code**: `403 Forbidden`

- When user is not Admin or Municipality user in the city

**Code**: `404 Not Found`

- When city is not found

## Approve City

Approve a pending city.

**URL**: `/api/cities/:cityId/approve`

**Method**: `POST`

**Auth required**: Yes (Admin only)

### URL Parameters

- `cityId`: The ID of the city to approve

### Success Response

**Code**: `200 OK`

**Content example**

```json
{
  "city": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Tel Aviv",
    "approvalStatus": "approved",
    "approvalDate": "2023-01-01T10:00:00.000Z"
    // ... other city fields
  }
}
```

### Error Responses

**Code**: `400 Bad Request`

- When cityId format is invalid

**Code**: `403 Forbidden`

- When user is not Admin

**Code**: `404 Not Found`

- When city is not found
- When city is not in pending status

## Deny City

Deny a pending city.

**URL**: `/api/cities/:cityId/deny`

**Method**: `POST`

**Auth required**: Yes (Admin only)

### Request Body

```json
{
  "reason": "City information is incomplete"
}
```

### Body Parameters

- `reason` (string, required): Reason for denying the city

### Success Response

**Code**: `200 OK`

**Content example**

```json
{
  "city": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Tel Aviv",
    "approvalStatus": "denied",
    "denialReason": "City information is incomplete"
    // ... other city fields
  }
}
```

### Error Responses

**Code**: `400 Bad Request`

- When cityId format is invalid
- When reason is not provided

**Code**: `403 Forbidden`

- When user is not Admin

**Code**: `404 Not Found`

- When city is not found
- When city is not in pending status

## Delete City

Delete a city.

**URL**: `/api/cities/:cityId`

**Method**: `DELETE`

**Auth required**: Yes (Admin only)

### URL Parameters

- `cityId`: The ID of the city to delete

### Success Response

**Code**: `200 OK`

**Content example**

```json
{
  "message": "City deleted successfully"
}
```

### Error Responses

**Code**: `400 Bad Request`

- When cityId format is invalid

**Code**: `403 Forbidden`

- When user is not Admin

**Code**: `404 Not Found`

- When city is not found
