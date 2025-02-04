import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/tenstack/query";
import { PostCard } from "@/components/social/PostCard";
import { Post } from "@/components/social/PostCard";
import { PostSkeleton } from "@/components/social/PostSkeleton";

export function PostFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
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
          fetchNextPage(); // Trigger next page load
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
    return <PostSkeleton />;
  }

  if (!data?.pages?.[0]?.posts?.length) {
    return <div className="text-center py-4">No posts found</div>;
  }


  return (
    <div className="space-y-16 mb-4">
      <h3 className="text-4xl font-bold mb-10 mt-20 ml-20">
        Your <span className="text-green-500">Social</span>
      </h3>

      {/* Render all loaded posts */}
      {data.pages.map((page) =>
        page.posts.map((post: Post) => <PostCard key={post._id} post={post} />)
      )}

      {/* Observed element */}
      {hasNextPage && (
        <div ref={observerRef} className="flex justify-center mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500"></div>
        </div>
      )}
    </div>
  );
}
