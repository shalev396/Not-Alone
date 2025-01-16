import { types, getUsersArray } from "./userHelper";

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
    body: (type: types) => {
      const user = getUsersArray().find((u: any) => u.type === type);
      return {
        email: user.email,
        password: "Test123!@#",
      };
    },
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

export const cityRoutes: route[] = [
  // Public routes
  {
    path: "/api/cities",
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
  },

  // Protected routes - Create city
  {
    path: "/api/cities",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Municipality"],
    body: {
      name: "Test City",
      zone: "north",
      bio: "Test city description",
      media: ["http://example.com/image.jpg"],
    },
  },

  // Join requests
  {
    path: "/api/cities/:cityId/join/municipality",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Municipality"],
    params: "cityId",
  },
  {
    path: "/api/cities/:cityId/join/soldier",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Soldier"],
    params: "cityId",
  },

  // Handle join requests
  {
    path: "/api/cities/:cityId/join-requests",
    method: "GET",
    auth: true,
    allowedTypes: ["Municipality", "Admin"],
    params: "cityId",
  },
  {
    path: "/api/cities/:cityId/join-requests/:userId",
    method: "POST",
    auth: true,
    allowedTypes: ["Municipality", "Admin"],
    params: "cityId",
    body: {
      action: "approve",
    },
  },

  // City management
  {
    path: "/api/cities/:cityId",
    method: "PUT",
    auth: true,
    allowedTypes: ["Admin", "Municipality"],
    params: "cityId",
    body: {
      name: "Updated City",
      zone: "south",
      bio: "Updated city description",
      media: ["http://example.com/new-image.jpg"],
    },
  },

  // Admin routes
  {
    path: "/api/cities/:cityId/approve",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin"],
    params: "cityId",
  },
  {
    path: "/api/cities/:cityId/deny",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin"],
    params: "cityId",
    body: {
      reason: "Denial reason",
    },
  },
  {
    path: "/api/cities/:cityId",
    method: "DELETE",
    auth: true,
    allowedTypes: ["Admin"],
    params: "cityId",
  },
];

export const businessRoutes: route[] = [];
export const discountRoutes: route[] = [];
export const donationRoutes: route[] = [];
export const eatUpRoutes: route[] = [];
export const requestRoutes: route[] = [];
export const profileRoutes: route[] = [];
