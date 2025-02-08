import { Navbar } from "@/components/shared/Navbar";
import { PostFeed } from "@/components/shared/feeds/PostFeed";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";

export default function Social() {
  const navigate = useNavigate();

  const handleCreatePost = () => {
    navigate("/create-post");
  };

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      {/* Navbar */}
      <Navbar modes="home" isVertical={true} isAccordion={true} />

      {/* Main Content */}
      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 mb-8">
            <h2 className="text-3xl font-bold text-center md:text-left">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Social Feed
              </span>
            </h2>
            <p className="text-muted-foreground text-center md:text-right">
              Connect with other members of the community
            </p>
          </div>

          {/* Feed */}
          <PostFeed />

          {/* Fixed Create Post Button */}
          <div className="fixed bottom-6 left-0 right-0 px-6 pl-[72px] sm:pl-20 md:pl-6 z-50">
            <div className="max-w-4xl mx-auto">
              <Button
                onClick={handleCreatePost}
                className="w-full shadow-lg hover:shadow-xl transition-all duration-200 gap-2 bg-primary/90 hover:bg-primary"
                size="lg"
              >
                <PenLine className="w-4 h-4" />
                Create Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
