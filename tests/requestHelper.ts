import fs from "fs";

export type request = {
  authorId: string;
  service: "Regular" | "Reserves";
  item: string;
  itemDescription: string;
  quantity: number;
  zone: "north" | "center" | "south";
  city: string;
  agreeToShareDetails: boolean;
  status: "approved" | "deny" | "in process";
  paid: boolean;
  paidBy?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export const getRequestsArray = () => {
  const requests = fs.readFileSync("tests/requests.json", "utf8");
  return JSON.parse(requests);
};
export const setRequestsArray = (requests: request[]) => {
  fs.writeFileSync("tests/requests.json", JSON.stringify(requests));
  console.log("saved");
};
export const clearRequests = () => {
  fs.writeFileSync("tests/requests.json", "[]");
  console.log("cleared");
};
