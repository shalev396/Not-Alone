export interface Discount {
    _id: string;
    title: string;
    description?: string;
    media: string[];
    category: string;
    createdAt: string;
    updatedAt: string;
    owner: {
      firstName: string;
      lastName: string;
      profileImage?: string;
    };
  }
  