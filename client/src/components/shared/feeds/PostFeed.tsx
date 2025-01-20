import { useQuery } from "@tanstack/react-query";
import { fetchPosts, posts } from "@/tenstack/query";
import { PostCard } from "@/components/social/PostCard";
import { Post } from "@/components/social/PostCard";
import { Skeleton } from "@/components/ui/skeleton";

export const PostSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 bg-muted/50 rounded-lg space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-28" />
        </div>
      ))}
    </div>
  );
};

export function PostFeed() {
  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5,
  });


  if (isPostsLoading) {
    return <PostSkeleton />;
  }

  if (!postsData || postsData.length === 0) {
    return <div className="text-center py-4">No post found</div>;
  }
  

  return (
    <div className="space-y-4">
      <h3 className="text-4xl font-bold mb-10 mt-20 ml-20">
        Your <span className="text-green-500">Social</span>
      </h3>
      {postsData.map((post: posts) => (
        <PostCard key={post._id} post={post as unknown as Post} />
      ))}
    </div>
  );
}
