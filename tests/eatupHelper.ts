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
  const donations = fs.readFileSync("tests/eatup.json", "utf8");
  return JSON.parse(donations);
};
export const setEatupArray = (donations: eatup[]) => {
  fs.writeFileSync("tests/eatup.json", JSON.stringify(donations));
  console.log("saved");
};
export const clearEatup = () => {
  fs.writeFileSync("tests/eatup.json", "[]");
  console.log("cleared");
};
