import fs from "fs";

export type donation = {
  city: string;
  address: string;
  category: "Furniture" | "Clothes" | "Electricity" | "Army Equipments";
  donorId: string;
  title: string;
  description?: string;
  media: string[];
  status: "pending" | "assigned" | "delivery" | "arrived";
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const getDonationsArray = () => {
  const donations = fs.readFileSync("tests/donations.json", "utf8");
  return JSON.parse(donations);
};
export const setDonationsArray = (donations: donation[]) => {
  fs.writeFileSync("tests/donations.json", JSON.stringify(donations));
  console.log("saved");
};
export const clearDonations = () => {
  fs.writeFileSync("tests/donations.json", "[]");
  console.log("cleared");
};
