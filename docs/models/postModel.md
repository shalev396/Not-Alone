# Post Model

## Overview

The Post model represents user-created posts in the system's social feed. Each post can include text content and media, and supports features like likes and comments. The model is designed to facilitate social interaction between users.

## Schema

```typescript
interface IPost {
  authorId: mongoose.Types.ObjectId;
  content: string;
  media: string[];
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Fields

| Field       | Type       | Required | Description                                |
| ----------- | ---------- | -------- | ------------------------------------------ |
| `authorId`  | ObjectId   | Yes      | Reference to the user who created the post |
| `content`   | string     | Yes      | The post text content                      |
| `media`     | string[]   | No       | Array of media URLs (images/videos)        |
| `likes`     | ObjectId[] | No       | Array of user IDs who liked the post       |
| `createdAt` | Date       | Yes      | Timestamp when the post was created        |
| `updatedAt` | Date       | Yes      | Timestamp when the post was last updated   |

### Validation Rules

- `content`: 1-2000 characters
- `media`: Maximum 10 items
- Each field is trimmed to remove whitespace
- Media URLs must be valid

### Indexes

- `authorId`: For finding posts by author
- `createdAt`: For chronological sorting
- Compound indexes:
  - `[authorId, createdAt]`: For efficient author post retrieval

### Virtuals

- `author`: Populates author user information
- `comments`: Populates associated comments
- `likesCount`: Returns the number of likes
- `commentsCount`: Returns the number of comments

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "authorId": "507f1f77bcf86cd799439012",
  "content": "Great day at the base!",
  "media": ["photo1.jpg", "photo2.jpg"],
  "likes": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Usage

```typescript
// Creating a new post
const post = await PostModel.create({
  authorId: userId,
  content: "New post content",
  media: ["image1.jpg"],
});

// Finding posts with pagination
const posts = await PostModel.find()
  .sort({ createdAt: -1 })
  .limit(20)
  .populate("author")
  .populate("comments");

// Adding a like to a post
await PostModel.findByIdAndUpdate(postId, {
  $addToSet: { likes: userId },
});

// Getting a user's posts with engagement metrics
const userPosts = await PostModel.find({ authorId: userId })
  .populate("author")
  .populate("comments")
  .select("+likesCount +commentsCount");
```

## Comment Integration

Posts are linked to comments through a virtual relationship. When retrieving posts:

- Comments can be populated with the `comments` virtual
- Comment count is available through the `commentsCount` virtual
- Comments are automatically sorted by creation date
- Comment creation triggers post update timestamp

## Security Considerations

1. Users can only edit/delete their own posts
2. Media URLs should be validated and sanitized
3. Like operations should be idempotent
4. Content should be sanitized to prevent XSS attacks
5. Post retrieval should respect user privacy settings
6. Rate limiting should be implemented for post creation
7. Large media arrays should be properly handled
