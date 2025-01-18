export interface Residence {
  _id: string;
  balcony: boolean;
  contractDuration: number; // Duration in months (assumption)
  description: string;
  authorId: string;
  enterDate: string; // ISO date string
  floor: number;
  location: string;
  media: string[]; // Array of media URLs
  meter: number; // Size in square meters
  owner: string;
  partners: number; // Number of partners/roommates
  phone: string; // Contact phone number
  price: number; // Monthly rental price
  propertyTax: number; // Monthly property tax
  rooms: number; // Number of rooms
  shalter: boolean; // Whether the property has a secure room
  storage: boolean; // Whether the property has storage space
  type: string; // Property type (e.g., Apartment)
  zone: string; // Area/zone (e.g., Center)
  __v: number; // Version number (from MongoDB)
}
