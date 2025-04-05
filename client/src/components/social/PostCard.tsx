import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Share, Heart, MoreVertical } from "lucide-react";
import { api } from "@/api/api";
import { RootState } from "@/Redux/store";
import { CommentDialog } from "./CommentDialog";

export interface Post {
  _id: string;
  content: string;
  media?: string[];
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    nickname?: string;
  };
  likes: string[];
  comments: Array<{
    _id: string;
    authorId: {
      profileImage?: string;
      nickname: string;
    };
    content: string;
    image?: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export function PostCard({ post }: { post: Post }) {
  const [likes, setLikes] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const isOwner = post.author._id === user._id;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userId = sessionStorage.getItem("id");
    setIsLiked(post.likes.includes(userId || ""));
  }, [post.likes]);

  const handleDeletePost = async () => {
    try {
      await api.delete(`/posts/${post._id}`);
      alert("Post deleted successfully");
    } catch (error) {
      alert("Failed to delete post");
      console.error(error);
    }
  };

  const handleReportPost = () => {
    alert("Post reported successfully");
  };

  const handleLike = async () => {
    try {
      const userId = sessionStorage.getItem("id");
      if (!userId) throw new Error("User not logged in");

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <Card className="p-6 mb-6 max-w-2xl mx-auto shadow-lg bg-card text-card-foreground rounded-lg">
        <div className="flex items-center mb-14">
          
        <img
  src={
    post.author.profileImage?.trim()
      ? `${window.location.origin}${post.author.profileImage.startsWith("/") ? "" : "/"}${post.author.profileImage}`
      : `${window.location.origin}/assets/profilePictures/default.svg`
  }
  alt={post.author.nickname || post.author.firstName}
  onError={(e) => {
    (e.target as HTMLImageElement).src =
      "/assets/profilePictures/default.svg";
  }}
  className="w-12 h-12 rounded-full border border-muted mr-4"
/>

          <div>
            <h3 className="font-bold text-base text-primary">
            {isOwner ? user.nickname : post.author.nickname || "Anonymous"}
            </h3>

            
            <p className="text-sm text-muted-foreground">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="ml-auto relative">
            <Button
              variant="ghost"
              className="hover:bg-muted p-1 rounded-full"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-40 bg-card shadow-lg rounded-lg z-10"
              >
                {isOwner ? (
                  <button
                    onClick={handleDeletePost}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                  >
                    Delete Post
                  </button>
                ) : (
                  <button
                    onClick={handleReportPost}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                  >
                    Report Post
                  </button>
                )}
              </div>
            )}
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
                    : `${window.location.origin}${mediaUrl.startsWith("/")
                        ? ""
                        : "/"}${mediaUrl}`
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
