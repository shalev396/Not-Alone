import { Navbar } from "@/components/shared/Navbar";
import { PostFeed } from "@/components/shared/feeds/PostFeed";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import createIcon from "@/assets/createIcon.png"

export default function Social() {
  const navigate = useNavigate();

  const handleCreatePost = () => {
    navigate("/create-post"); 
  };

  return (
    <div className="flex bg-background text-foreground min-h-screen relative">
      {/* Navbar */}
      <Navbar modes="home" isVertical={true} isAccordion={true} />

      {/* Feed */}
      <div className="flex-1 mx-10">
        <PostFeed mode="post" />
      </div>

      <Button
        onClick={handleCreatePost}
        className="fixed bottom-6 left-6 bg-green-500 text-white p-6 rounded-lg shadow-lg hover:bg-green-400 flex items-center justify-center transition-colors duration-200"
        aria-label="Create Post"
      >
        <img
          src={createIcon}
          alt="Create Post"
          className="w-6 h-6"
        />
      </Button> 


    </div>
  );
}
