import fs from "fs";

export type types =
  | "Admin"
  | "Soldier"
  | "Municipality"
  | "Donor"
  | "Organization"
  | "Business";

export type users = {
  type: types;
  email: string;
  password: string;
  token?: string;
  id?: string;
};

export const getUsersArray = () => {
  const users = fs.readFileSync("users.json", "utf8");
  return JSON.parse(users);
};
export const setUsersArray = (users: users[]) => {
  fs.writeFileSync("users.json", JSON.stringify(users));
  console.log("saved");
};
export const clearUsers = () => {
  fs.writeFileSync("users.json", "[]");
  console.log("cleared");
};
