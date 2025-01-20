import { api } from "@/api/api";
import { Donation } from "@/types/Donation";
import { Residence } from "@/types/Residence";
import { EatUp } from "@/types/EatUps";
import store from "@/Redux/store";
import { logout } from "@/Redux/authSlice";
import { AxiosError } from "axios";

export interface posts {
  author: {
    firstName: string;
    lastName: string;
    profileImage?: string; 
    nickname?: string; 
  };
  content: string;
  image: string[];
  likes: string[];
  _id: string;
  createdAt: Date;
  comments: comments[];
}


export interface comments {
  user: string;
  text: string;
  createdAt: Date;
}

const handleUnauthorized = () => {
  sessionStorage.clear();
  store.dispatch(logout());
  window.location.href = "/";
};

export const fetchDonations = async (): Promise<Donation[]> => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      handleUnauthorized();
      return [];
    }
    const res = await api.get("/donation");
    return res.data;
  } catch (error) {
    console.error("Error fetching donations:", error);
    if (
      (error as AxiosError)?.response?.status === 401 ||
      (error as AxiosError)?.response?.status === 403
    ) {
      handleUnauthorized();
    }
    return [];
  }
};

export const fetchResidences = async (): Promise<Residence[]> => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      handleUnauthorized();
      return [];
    }
    const res = await api.get("/residences");
    if (Array.isArray(res.data)) {
      return res.data;
    } else if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching residences:", error);
    if (
      (error as AxiosError)?.response?.status === 401 ||
      (error as AxiosError)?.response?.status === 403
    ) {
      handleUnauthorized();
    }
    return [];
  }
};

export const fetchPosts = async (): Promise<posts[]> => {
  try {
    const res = await api.get("/posts");
    console.log("Posts fetched:", res.data);

    return res.data.posts.map((post: any) => ({
      ...post,
      comments: post.comments || [],
      author: {
        ...post.author,
        profileImage: post.author?.profileImage || "/assets/profilePictures/default.svg", // Fallback
      },
    }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};






//Likes
export const toggleLike = async (postId: string, userId: string) => {
  try {
    const response = await api.post(`/posts/${postId}/like`, { userId });
    return response.data;
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

export const fetchEatUps = async (): Promise<EatUp[]> => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      handleUnauthorized();
      return [];
    }
    const res = await api.get("/eatups");
    return res.data.eatups || [];
  } catch (error) {
    console.error("Error fetching eatups:", error);
    if (
      (error as AxiosError)?.response?.status === 401 ||
      (error as AxiosError)?.response?.status === 403
    ) {
      handleUnauthorized();
    }
    return [];
  }
};
