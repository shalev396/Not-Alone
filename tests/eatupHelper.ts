import fs from "fs";

export type eatup = {
  city: string;
  title: string;
  authorId: string;
  media: string[];
  date: Date;
  kosher: boolean;
  description: string;
  languages: string[];
  hosting: "organization" | "donators" | "city";
  limit: number;
  guests: string[];
  createdAt: Date;
  updatedAt: Date;
};

export const getEatupArray = () => {
  const donations = fs.readFileSync("eatup.json", "utf8");
  return JSON.parse(donations);
};
export const setEatupArray = (donations: eatup[]) => {
  fs.writeFileSync("eatup.json", JSON.stringify(donations));
  console.log("saved");
};
export const clearEatup = () => {
  fs.writeFileSync("eatup.json", "[]");
  console.log("cleared");
};
