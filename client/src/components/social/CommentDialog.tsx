import React, { useState, useEffect, useRef } from "react";
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
import { useSelector } from "react-redux";

interface Comment {
  _id: string;
  authorId: {
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

  const dialogRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { nickname, profileImage } = useSelector((state: any) => state.user);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/comments/post/${post._id}`);
        setComments(response.data.comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    if (isOpen) {
      fetchComments();
    }
  }, [post._id, isOpen]);

  const handleAddComment = async () => {
    // 1. Limpe erros anteriores.
    setError(null);
  
    // 2. Validação: Verifique se o comentário ou imagem estão ausentes.
    if (!newComment.trim() && !newCommentImage) {
      setError("You must provide either text comment or an image."); // Define a mensagem de erro.
      return; // Interrompe a execução.
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
        postId: post._id, 
        content: newComment.trim(),
        image: imageUrl || null,
      };
  
      const response = await api.post(`/comments`, newCommentData);
  
      const newCommentWithDetails: Comment = {
        _id: response.data._id,
        content: response.data.content,
        image: response.data.image,
        createdAt: response.data.createdAt,
        authorId: {
          nickname,
          profileImage,
        },
      };
  
      setComments((prev) => [...prev, newCommentWithDetails]);
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

  const handleDismissError = () => setError(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50" />
        <DialogContent
          ref={dialogRef}
          className="fixed left-1/2 top-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[90vh] overflow-hidden bg-card rounded-lg shadow-lg flex"
          onClick={handleDismissError} // Remove o erro ao clicar fora
        >
          <DialogTitle className="sr-only">Comment on Post</DialogTitle>

          {/* Lado esquerdo: Imagem (somente em telas desktop) */}
          {post.media?.[0] && (
            <div className="hidden md:flex w-1/2 items-center justify-center bg-muted h-full">
              <img
                src={post.media[0]}
                alt="Post media"
                className="object-contain max-w-full max-h-full rounded-md border border-muted"
              />
            </div>
          )}

          {/* Lado direito */}
          <div className={`relative flex-1 flex flex-col ${post.media?.[0] ? "md:w-1/2 w-full" : "w-full"}`}>
            {/* Texto do Post */}
            <div className="p-4 border-b border-muted bg-card max-h-[15%]">
            <p
              className="text-card-foreground text-sm truncate"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {post.content}
            </p>
          </div>
            {/* Lista de Comentários */}
            <div className="relative flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {comments.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      src={comment.authorId.profileImage || "/default-avatar.png"}
                      alt={comment.authorId.nickname}
                      className="w-10 h-10 rounded-full bg-muted"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-card-foreground">
                      <span className="font-semibold text-primary">
                        {comment.authorId.nickname || "Anonymous"}
                      </span>{" "}
                      {comment.content}
                    </p>
                    {comment.image && (
                      <img
                        src={comment.image}
                        alt="Comment media"
                        className="mt-2 rounded-md max-w-[300px] max-h-[200px] object-cover border border-muted"
                        />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pré-visualização da Imagem e Mensagem de Erro */}
            <div className="absolute bottom-20 left-4 w-full px-4 flex items-start space-x-4">
              {previewUrl && (
                <div className="relative w-[150px] h-[150px] bottom-5">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border border-muted"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-[-10px] right-[-10px] bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-muted-foreground"
                  >
                    ❌
                  </button>
                </div>
              )}
            </div>

            {/* Rodapé */}
            <div className="bg-card p-4 border-muted">
              <div className="flex items-center space-x-2">
                <Textarea
                  ref={textareaRef}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 resize-none bg-muted text-muted-foreground border border-muted focus:ring-primary focus:border-primary rounded-lg"
                  />
                  
                <button
              className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg flex justify-center items-center"
              onClick={() => fileInputRef.current?.click()}
                >
                  <img src={upload} alt="Upload" className="w-5 h-5" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={loading || uploading}
                  className={`bg-primary text-primary-foreground hover:bg-primary/90 py-4 w-15 rounded-lg flex items-center justify-center ${
                    loading || uploading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading || uploading ? "Loading..." : "Add"}
                </Button>
              </div>
                {error && (
                <p className="text-destructive text-sm mt-1">
                  {error}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
