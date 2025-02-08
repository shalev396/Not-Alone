import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/tenstack/query";
import { PostCard } from "@/components/social/PostCard";
import { Post } from "@/components/social/PostCard";
import { PostSkeleton } from "@/components/social/PostSkeleton";

export function PostFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["posts"],
      queryFn: fetchPosts,
      getNextPageParam: (lastPage) =>
        lastPage.pagination.page < lastPage.pagination.pages
          ? lastPage.pagination.page + 1
          : undefined,
      initialPageParam: 1,
    });

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (!data?.pages?.[0]?.posts?.length) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border shadow-sm">
        <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
        <p className="text-muted-foreground">
          Be the first to share something with the community!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Render all loaded posts */}
      {data.pages.map((page, i) => (
        <div key={i} className="space-y-6">
          {page.posts.map((post: Post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ))}

      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      )}

      {/* Intersection observer target */}
      {hasNextPage && (
        <div ref={observerRef} className="h-4" aria-hidden="true" />
      )}
    </div>
  );
}
