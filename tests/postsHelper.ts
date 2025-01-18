import fs from "fs";

export type post = {
  authorId: string;
  content: string;
  media: string[];
  createdAt: Date;
  likes: string[];
  comments: string[];
};

export const getPostsArray = () => {
  const posts = fs.readFileSync("posts.json", "utf8");
  return JSON.parse(posts);
};
export const setPostsArray = (posts: post[]) => {
  fs.writeFileSync("posts.json", JSON.stringify(posts));
  console.log("saved");
};
export const clearPosts = () => {
  fs.writeFileSync("posts.json", "[]");
  console.log("cleared");
};
