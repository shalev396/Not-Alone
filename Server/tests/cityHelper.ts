import fs from "fs";

export type city = {
  name: string;
  zone: string;
  soldiers: string[];
  municipalityUsers: string[];
  media: string[];
  bio: string;
  approvalStatus: "pending" | "approved" | "denied";
  approvalDate?: Date;
  denialReason?: string;
  pendingJoins: {
    userId: string;
    type: "Soldier" | "Municipality";
  }[];
  createdAt: Date;
  updatedAt: Date;
};

export const getCitiesArray = () => {
  const cities = fs.readFileSync("tests/cities.json", "utf8");
  return JSON.parse(cities);
};
export const setCitiesArray = (cities: city[]) => {
  fs.writeFileSync("tests/cities.json", JSON.stringify(cities));
  console.log("saved");
};
export const clearCities = () => {
  fs.writeFileSync("tests/cities.json", "[]");
  console.log("cleared");
};
