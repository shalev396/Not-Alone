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

  const { nickname, profileImage } = useSelector((state: any) => state.user);

  // **Busca os comentários do backend**
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
        postId: post._id,
        content: newComment,
        image: imageUrl,
      };

      const response = await api.post(`/posts/${post._id}/comment`, newCommentData);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50" />
        <DialogContent
          ref={dialogRef}
          className="fixed left-1/2 top-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[90vh] overflow-hidden bg-gray-900 rounded-lg shadow-lg"
        >
          <DialogTitle className="sr-only">Comment on Post</DialogTitle>
          <div className="w-full h-full flex">
           {/* Lado esquerdo: Imagem */}
{post.media?.[0] && (
  <div
    className="w-1/2 flex items-center justify-center bg-black"
    style={{
      height: "100%", // Contêiner ocupa toda a altura do Dialog
    }}
  >
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        height: "calc(90vh - 100px)", // Altura fixa calculada com base no Dialog
        maxHeight: "calc(90vh - 100px)", // Garante limite de altura
      }}
    >
      <img
        src={post.media[0]}
        alt="Post media"
        className="object-contain max-w-full max-h-full rounded-md"
      />
    </div>
  </div>
)}


            {/* Lado direito: Texto do post e comentários */}
            <div
              className={`flex-1 flex flex-col ${
                post.media?.[0] ? "w-1/2" : "w-full"
              }`}
            >
              {/* Texto do Post */}
              <div className="p-4 border-b border-gray-800 overflow-y-auto scrollbar-thin max-h-[20%]">
                <p
                  className="text-white text-sm whitespace-pre-wrap"
                  style={{
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {post.content}
                </p>
              </div>

              {/* Lista de Comentários */}
<div
  className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
  style={{
    maxHeight: "calc(90vh - 150px)", // Define uma altura máxima para a lista de comentários
  }}
>
  {comments.map((comment) => (
    <div key={comment._id} className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <img
          src={comment.authorId.profileImage || "/default-avatar.png"}
          alt={comment.authorId.nickname}
          className="w-10 h-10 rounded-full bg-gray-800"
        />
      </div>
      <div className="flex-1">
        <p
          className="text-sm"
          style={{
            wordWrap: "break-word",
            overflowWrap: "anywhere",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <span className="font-semibold text-primary">
            {comment.authorId.nickname || "Anonymous"}
          </span>{" "}
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


              {/* Campo de Adicionar Comentário */}
              <div className="bg-gray-800 p-4 border-t">
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {previewUrl && (
                  <div className="relative w-[200px] h-[200px] mb-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg border border-gray-700"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-[-10px] right-[-10px] bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-gray-300"
                    >
                      ❌
                    </button>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 resize-none bg-gray-700 text-gray-200 border border-gray-600 focus:ring-primary focus:border-primary rounded-lg"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-pink-500 hover:bg-pink-400 text-white py-2 px-4 rounded-lg flex justify-center items-center"
                  >
                    <img src={upload} alt="upload" className="w-5 h-5" />
                  </label>
                  <Button
                    onClick={handleAddComment}
                    disabled={loading || uploading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-lg"
                  >
                    {loading ? "Posting..." : "Add"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
