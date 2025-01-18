export interface Donation {
  type: string;
  _id: string;
  authorId: string;
  category: "all" | "Furniture" | "Electronics" | "Clothes";
  description: string;
  title?: string;
  location: string;
  zone: "all" | "North" | "Center" | "South";
  media?: string[];
  createdAt?: string;
  ownerPhone?: string;
  __v: number;
}
