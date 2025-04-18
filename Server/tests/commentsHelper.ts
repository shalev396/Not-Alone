import fs from "fs";

export type comment = {
  _id?: string;
  authorId: string;
  postId: string;
  content: string;
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
};

export const getCommentsArray = () => {
  const comments = fs.readFileSync("tests/comments.json", "utf8");
  return JSON.parse(comments);
};

export const setCommentsArray = (comments: comment[]) => {
  fs.writeFileSync("tests/comments.json", JSON.stringify(comments));
  console.log("saved");
};

export const clearComments = () => {
  fs.writeFileSync("tests/comments.json", "[]");
  console.log("cleared");
};
