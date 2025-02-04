import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchUserPosts, PaginationResponse } from "@/tenstack/query";
import { Post } from "@/components/social/PostCard";
import { PostCard } from "@/components/social/PostCard";
import { PostSkeleton } from "@/components/social/PostSkeleton";

interface FilteredPostFeedProps {
  userId: string; // ID do usuário cujo perfil está sendo exibido
}

export const FilteredPostFeed: React.FC<FilteredPostFeedProps> = ({ userId }) => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<PaginationResponse<Post>, Error>({
    queryKey: ["userPosts", userId],
    queryFn: ({ pageParam = 1 }) =>
      fetchUserPosts({ userId, pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.pages
        ? lastPage.pagination.page + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!userId,
  });

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
    return <PostSkeleton />;
  }

  if (!data?.pages?.[0]?.posts?.length) {
    return <div className="text-center py-4">No posts found</div>;
  }

  return (
    <div className="space-y-4">
      {data.pages.map((page) =>
        page.posts.map((post: Post) => <PostCard key={post._id} post={post} />)
      )}
      {hasNextPage && (
        <div ref={observerRef} className="flex justify-center mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500"></div>
        </div>
      )}
    </div>
  );
};
