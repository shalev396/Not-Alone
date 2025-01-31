import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Share, Heart } from "lucide-react";
import { api } from "@/api/api";
import { CommentDialog } from "./CommentDialog";

export interface Post {
  _id: string;
  content: string;
  media?: string[];
  author: {
    firstName: string;
    lastName: string;
    profileImage?: string;
    nickname?: string;
  };
  likes: string[];
  comments: Array<{
    author: string;
    nickname: string;
    profileImage?: string;
    text: string;
    createdAt: Date | string;
  }>;
  createdAt: Date | string;
}

export function PostCard({ post }: { post: Post }) {
  const [likes, setLikes] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);

  const nicknames = [
    "Arlo", "Finn", "Theo", "Milo", "Levi",
    "Ellis", "Ivy", "June", "Noa", "Jade",
    "Eden", "Luca", "Nico", "Zara", "Sage",
    "Remy", "Emmy", "Beau", "Tess", "Rue",
    "Cal", "Lex", "Ezra", "Ash", "Kai",
    "Quinn", "Lena", "Isla", "Romy", "Juno",
    "Nova", "Cleo", "Wren", "Aria", "Drew",
    "Skye", "Blair", "Lila", "Elle", "Rey",
    "Mae", "Eli", "Liv", "Ada", "Hale",
    "Cade", "Pax", "Vale", "Reed", "Noel",
  ];

  const getRandomNickname = (): string => {
    return nicknames[Math.floor(Math.random() * nicknames.length)];
  };

  useEffect(() => {
    const userId = sessionStorage.getItem("id");
    setIsLiked(post.likes.includes(userId || ""));
  }, [post.likes]);

  const handleLike = async () => {
    try {
      const userId = sessionStorage.getItem("id");
      if (!userId) {
        throw new Error("User not logged in");
      }

      setIsLiked((prev) => !prev);
      setLikes((prev) => (isLiked ? prev - 1 : prev + 1));

      const response = await api.post(`/posts/${post._id}/like`, { userId });

      const updatedLikes = response.data.likes;
      setLikes(updatedLikes.length);
      setIsLiked(updatedLikes.includes(userId));
    } catch (error) {
      console.error("Failed to like/unlike post:", error);

      setIsLiked((prev) => !prev);
      setLikes((prev) => (isLiked ? prev + 1 : prev - 1));
    }
  };

  return (
    <>
      <Card className="p-6 mb-6 max-w-2xl mx-auto shadow-lg bg-card text-card-foreground rounded-lg">
        <div className="flex items-center mb-14">
          <img
            src={
              post.author.profileImage && post.author.profileImage.trim() !== ""
                ? `${window.location.origin}${post.author.profileImage.startsWith("/") ? "" : "/"}${post.author.profileImage}`
                : `${window.location.origin}/assets/profilePictures/default.svg`
            }
            alt={post.author.firstName}
            className="w-12 h-12 rounded-full border border-muted mr-4"
          />

          <div>
            <h3 className="font-bold text-base text-primary">
              {post.author.nickname?.trim()
                ? post.author.nickname
                : getRandomNickname()}
            </h3>
            <p className="text-sm text-muted-foreground">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {Array.isArray(post.media) && post.media.length > 0 && (
          <div className="grid mb-8">
  {post.media.map((mediaUrl, index) => (
    <img
      key={index}
      src={
        mediaUrl.startsWith("http")
          ? mediaUrl
          : `${window.location.origin}${mediaUrl.startsWith("/") ? "" : "/"}${mediaUrl}` // URL relativa
      }
      alt={`Post media ${index + 1}`}
      className="rounded-md w-full h-auto object-cover border border-muted"
    />
  ))}
</div>

        )}

        <p
          className="text-foreground mb-4"
          style={{
            wordBreak: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {post.content}
        </p>
        <div className="flex justify-between items-center text-muted-foreground">
          <Button
            variant="ghost"
            className={`flex items-center space-x-2 ${isLiked ? "text-green-500" : "hover:text-primary"}`}
            onClick={handleLike}
          >
            <Heart className="w-4 h-4" />
            <span>{likes}</span>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center space-x-2 hover:text-primary"
            onClick={() => setIsCommentDialogOpen(true)}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comment</span>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center space-x-2 hover:cursor-not-allowed"
          >
            <Share className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>
      </Card>

      {isCommentDialogOpen && (
        <CommentDialog
          post={post}
          isOpen={isCommentDialogOpen}
          onClose={() => setIsCommentDialogOpen(false)}
        />
      )}
    </>
  );
}
