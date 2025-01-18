import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { posts } from "@/tenstack/query";

interface PostDialogProps {
  post: posts | null;
}

export function PostDialog({ post }: PostDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <div className="p-4 flex gap-4">
            <div className="w-[150px] h-[150px]">
              {post?.image ? (
                <img
                  src={post.image}
                  alt="post"
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                  No Image
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg md:text-xl">{post?.content}</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                {post?.createdAt &&
                  new Date(post.createdAt).toLocaleDateString()}
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                {post?.likes.length} likes
              </p>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Post Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {/* Add detailed post content here */}
          <img
            src={post?.image}
            alt="post"
            className="w-full max-h-[400px] object-cover rounded-lg mb-4"
          />
          <p className="text-lg">{post?.content}</p>
          <div className="mt-4 text-muted-foreground">
            <p>
              Posted on:{" "}
              {post?.createdAt && new Date(post.createdAt).toLocaleDateString()}
            </p>
            <p>Likes: {post?.likes.length}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
