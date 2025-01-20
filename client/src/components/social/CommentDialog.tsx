import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { uploadImage } from "@/components/shared/UploadPhoto";
import { api } from "@/api/api";
import upload from "@/assets/upload.png";

interface Comment {
  user: {
    nickname: string;
    profileImage?: string;
  };
  content: string;
  image?: string;
  createdAt?: string;
}

export function CommentDialog({
  post,
  isOpen,
  onClose,
}: {
  post: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newCommentImage, setNewCommentImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments when dialog opens
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/comments/post/${post._id}`); // Use novo endpoint
        setComments(response.data.comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    if (post._id) {
      fetchComments();
    }
  }, [post._id]); // Dispara ao mudar o post

  // Handle new comment addition
  const handleAddComment = async () => {
    setError(null);

    if (!newComment && !newCommentImage) {
      setError("You must provide text or an image.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";

      if (newCommentImage) {
        setUploading(true);
        imageUrl = await uploadImage(newCommentImage);
        setUploading(false);
      }

      const newCommentData = {
        content: newComment,
        image: imageUrl,
        postId: post._id,
      };

      console.log("Sending comment data:", newCommentData);

      // Enviar comentário para o backend
      const response = await api.post(`/comments`, newCommentData);

      // Adicionar comentário retornado à lista
      setComments((prevComments) => [...prevComments, response.data]);
      setNewComment("");
      setNewCommentImage(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewCommentImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setNewCommentImage(null);
    setPreviewUrl(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50" />
        <DialogContent className="fixed left-1/2 top-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-h-screen max-w-full overflow-hidden md:max-w-4xl md:h-[85vh]">
          <DialogTitle className="sr-only">Comment on Post</DialogTitle>
          <div className="bg-gray-900 rounded-lg shadow-lg w-full h-full flex flex-col">
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {post.image && (
                <div className="hidden md:block w-full md:w-1/2 bg-black flex items-center justify-center overflow-hidden">
                  <img
                    src={post.image}
                    alt="Post"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <div className={`flex-1 flex flex-col overflow-hidden ${post.image ? "md:w-1/2" : "w-full"}`}>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {comments.map((comment, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <img
                        src={comment.user?.profileImage || "/default-avatar.png"}
                        alt={comment.user?.nickname}
                        className="w-10 h-10 rounded-full bg-gray-800"
                      />
                      <div>
                        <p className="text-sm">
                          <span className="font-semibold text-primary">{comment.user?.nickname || "Anonymous"}</span>
                          {": "}
                          {comment.content}
                        </p>
                        {comment.image && (
                          <img
                            src={comment.image}
                            alt="Comment media"
                            className="mt-2 rounded-md max-w-[300px] max-h-[200px] object-cover"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-800 p-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {previewUrl && (
                    <div className="relative w-[200px] h-[200px]">
                      <img src={previewUrl} alt="Preview" className="object-cover rounded-lg" />
                      <button onClick={handleRemoveImage}>❌</button>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1"
                    />
                    <input type="file" id="file-upload" onChange={handleFileChange} className="hidden" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <img src={upload} alt="upload" />
                    </label>
                    <Button onClick={handleAddComment} disabled={loading || uploading}>
                      {loading ? "Posting..." : "Add"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
