import fs from "fs";

export type discount = {
  name: string;
  discount: string;
  expireDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export const getDiscountsArray = () => {
  const discounts = fs.readFileSync("tests/discounts.json", "utf8");
  return JSON.parse(discounts);
};
export const setDiscountsArray = (discounts: discount[]) => {
  fs.writeFileSync("tests/discounts.json", JSON.stringify(discounts));
  console.log("saved");
};
export const clearDiscounts = () => {
  fs.writeFileSync("tests/discounts.json", "[]");
  console.log("cleared");
};
