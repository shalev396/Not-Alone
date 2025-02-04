import { api } from "@/api/api";
import { Donation } from "@/types/Donation";
import { Residence } from "@/types/Residence";
import { EatUp } from "@/types/EatUps";
import store from "@/Redux/store";
import { logout } from "@/Redux/authSlice";
import { AxiosError } from "axios";
import { Post } from "@/components/social/PostCard";

export interface PaginationResponse<T> {
  posts: T[];
  pagination: {
    page: number;
    total: number;
    pages: number;
  };
}


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


export const fetchPosts = async ({
  pageParam = 1, // Valor padrão
}: {
  pageParam: any;
}): Promise<PaginationResponse<Post>> => {
  const res = await api.get(`/posts?page=${pageParam}&limit=2`); // Configuração do limite
  return {
    posts: res.data.posts.map((post: any) => ({
      ...post,
      author: {
        _id: post.author._id,
        firstName: post.author.firstName,
        lastName: post.author.lastName,
        profileImage: post.author.profileImage || "/assets/profilePictures/default.svg",
        nickname: post.author.nickname || "",
      },
      comments: post.comments || [],
    })),
    pagination: res.data.pagination,
  };
};

export const fetchUserPosts = async ({
  userId,
  pageParam = 1,
}: {
  userId: string;
  pageParam: any;
}): Promise<PaginationResponse<Post>> => {
  const res = await api.get(`/posts/user/${userId}?page=${pageParam}&limit=2`);

  return {
    posts: res.data.posts.map((post: any) => ({
      ...post,
      author: {
        _id: post.author._id,
        firstName: post.author.firstName,
        lastName: post.author.lastName,
        profileImage: post.author.profileImage || "/assets/profilePictures/default.svg",
        nickname: post.author.nickname || "",
      },
      comments: post.comments || [],
    })),
    pagination: {
      page: res.data.pagination.page,
      total: res.data.pagination.total,
      pages: res.data.pagination.pages,
    },
  };
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
