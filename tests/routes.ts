import { types } from "./userHelper";

type route = {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, any> | ((type: types) => Record<string, any>);
  query?: string[];
  params?: string;
  auth: boolean;
  allowedTypes: types[];
};

export const authRoutes: route[] = [
  {
    path: "/api/auth/register",
    method: "POST",
    auth: false,
    allowedTypes: [
      "Admin",
      "Soldier",
      "Municipality",
      "Donor",
      "Organization",
      "Business",
    ],
    body: (type: types) => ({
      firstName: "Test",
      lastName: type,
      passport: Math.floor(Math.random() * 1000000000).toString(),
      email: `test${type.toLowerCase()}${Math.random()
        .toString(36)
        .substring(7)}@example.com`,
      password: "Test123!@#",
      phone: `05012345${Math.floor(Math.random() * 100)}`,
      type: type,
      preferences: {
        language: "en",
        notifications: false,
      },
    }),
  },
  {
    path: "/api/auth/login",
    method: "POST",
    auth: false,
    allowedTypes: [
      "Admin",
      "Soldier",
      "Municipality",
      "Donor",
      "Organization",
      "Business",
    ],
    body: (type: types) => ({
      email: `test${type.toLowerCase()}@example.com`,
      password: "Test123!@#",
    }),
  },
];

export const userRoutes: route[] = [
  // Public routes
  {
    path: "/api/users/pending/:userId",
    method: "GET",
    auth: false,
    allowedTypes: [
      "Admin",
      "Soldier",
      "Municipality",
      "Donor",
      "Organization",
      "Business",
    ],
    params: "userId",
  },

  // Protected routes
  {
    path: "/api/users/me",
    method: "GET",
    auth: true,
    allowedTypes: [
      "Admin",
      "Soldier",
      "Municipality",
      "Donor",
      "Organization",
      "Business",
    ],
  },
  {
    path: "/api/users/me",
    method: "PUT",
    auth: true,
    allowedTypes: [
      "Admin",
      "Soldier",
      "Municipality",
      "Donor",
      "Organization",
      "Business",
    ],
    body: {
      firstName: "Updated",
      lastName: "Name",
      phone: `05012345${Math.floor(Math.random() * 100)}`,
      preferences: {
        language: "en",
        notifications: true,
      },
    },
  },

  // Admin routes
  {
    path: "/api/users/all",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin"],
    query: ["type", "approvalStatus"],
  },
  {
    path: "/api/users/pending",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin"],
  },

  // User management routes
  {
    path: "/api/users/:userId",
    method: "PUT",
    auth: true,
    allowedTypes: ["Admin"],
    params: "userId",
    body: {
      firstName: "Updated",
      lastName: "User",
      phone: `05012345${Math.floor(Math.random() * 100)}`,
      type: "Soldier",
      approvalStatus: "approved",
      preferences: {
        language: "en",
        notifications: true,
      },
    },
  },
  {
    path: "/api/users/approve/:userId",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin"],
    params: "userId",
  },
  {
    path: "/api/users/deny/:userId",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin"],
    params: "userId",
    body: {
      reason: "Denial reason",
    },
  },
  {
    path: "/api/users/:userId",
    method: "DELETE",
    auth: true,
    allowedTypes: ["Admin"],
    params: "userId",
  },
];

export const cityRoutes: route[] = [];
export const businessRoutes: route[] = [];
export const discountRoutes: route[] = [];
export const donationRoutes: route[] = [];
export const eatUpRoutes: route[] = [];
export const requestRoutes: route[] = [];
export const profileRoutes: route[] = [];
