import fs from "fs";

export type profile = {
  userId: string;
  nickname: string;
  bio: string;
  profileImage: string;
  visibility: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
};

export const getProfileArray = () => {
  const donations = fs.readFileSync("profiles.json", "utf8");
  return JSON.parse(donations);
};
export const setProfileArray = (profiles: profile[]) => {
  fs.writeFileSync("profiles.json", JSON.stringify(profiles));
  console.log("saved");
};
export const clearProfile = () => {
  fs.writeFileSync("profiles.json", "[]");
  console.log("cleared");
};
