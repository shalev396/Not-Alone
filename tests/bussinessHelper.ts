import fs from "fs";

export type business = {
  name: string;
  slogan: string;
  media: string[];
  owner: string;
  workers: string[];
  discounts: string[];
  status: "pending" | "approved" | "denied";
  pendingWorkers: string[];
  createdAt: Date;
  updatedAt: Date;
};

export const getBusinessesArray = () => {
  const businesses = fs.readFileSync("tests/businesses.json", "utf8");
  return JSON.parse(businesses);
};
export const setBusinessesArray = (businesses: business[]) => {
  fs.writeFileSync("tests/businesses.json", JSON.stringify(businesses));
  console.log("saved");
};
export const clearBusinesses = () => {
  fs.writeFileSync("tests/businesses.json", "[]");
  console.log("cleared");
};
