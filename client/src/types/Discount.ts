
export interface Discount {
    _id: string;
    title: string;
    category:
      | "Health & Wellness"
      | "Clothes"
      | "Gear & Equipment"
      | "Electronics"
      | "Entertainment"
      | "Home";
    description?: string;
    media: string[];
    owner: string;
    createdAt: string;
    updatedAt: string;
  }
  