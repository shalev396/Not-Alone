# Comment Model

## Overview

The Comment model represents user comments on posts in the system. Each comment is associated with a specific post and can receive likes from other users.

## Schema

```typescript
interface IComment {
  authorId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  content: string;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Fields

| Field       | Type       | Required | Description                                   |
| ----------- | ---------- | -------- | --------------------------------------------- |
| `authorId`  | ObjectId   | Yes      | Reference to the user who created the comment |
| `postId`    | ObjectId   | Yes      | Reference to the post the comment belongs to  |
| `content`   | string     | Yes      | The comment text content                      |
| `likes`     | ObjectId[] | No       | Array of user IDs who liked the comment       |
| `createdAt` | Date       | Yes      | Timestamp when the comment was created        |
| `updatedAt` | Date       | Yes      | Timestamp when the comment was last updated   |

### Indexes

- `postId, createdAt`: For efficiently retrieving comments on a post by date
- `authorId, createdAt`: For finding a user's comments by date
- Compound indexes for common queries

### Virtuals

- `author`: Populates author user information
- `post`: Populates associated post information
- `likesCount`: Returns the number of likes on the comment

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "authorId": "507f1f77bcf86cd799439012",
  "postId": "507f1f77bcf86cd799439013",
  "content": "Great post! Thanks for sharing.",
  "likes": ["507f1f77bcf86cd799439014", "507f1f77bcf86cd799439015"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Usage

```typescript
// Creating a new comment
const comment = await CommentModel.create({
  authorId: userId,
  postId: postId,
  content: "New comment content",
});

// Finding comments for a post
const postComments = await CommentModel.find({ postId })
  .sort({ createdAt: -1 })
  .populate("author");

// Adding a like to a comment
await CommentModel.findByIdAndUpdate(commentId, {
  $addToSet: { likes: userId },
});

// Getting a user's comments
const userComments = await CommentModel.find({ authorId: userId })
  .sort({ createdAt: -1 })
  .populate("post");
```

## Validation Rules

1. Content must be between 1 and 1000 characters
2. Post must exist before a comment can be created
3. Likes array must contain unique user IDs
4. Author must be a valid user in the system

## Security Considerations

1. Users should only be able to edit/delete their own comments
2. Comments should be deleted when their associated post is deleted
3. Like operations should be idempotent
4. Content should be sanitized to prevent XSS attacks
5. Access to comments should respect the post's visibility settings
6. Rate limiting should be implemented for comment creation
