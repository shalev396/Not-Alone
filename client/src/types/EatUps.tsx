export interface EatUp {
  _id: string;
  location: string;
  city: {
    _id: string;
    name: string;
    zone: string;
  };
  zone: string;
  title: string;
  description: string;
  date: string;
  kosher: boolean;
  hosting: string;
  media?: string[];
  owner: string;
  guests?: string[];
  limit?: number;
  channel?: {
    _id: string;
  };
  authorId?: string;
  languages?: string[];
}
