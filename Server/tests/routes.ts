import { types, getUsersArray, users } from "./userHelper";
import { getDiscountsArray } from "./discountHelper";
import { getCitiesArray } from "./cityHelper";
import { getPostsArray } from "./postsHelper";

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
      phone: `+97250${Math.floor(Math.random() * 10000000)
        .toString()
        .padStart(7, "0")}`,
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

export const businessRoutes: route[] = [
  // Public routes (still need authentication)
  {
    path: "/api/businesses",
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
    path: "/api/businesses/:businessId",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin", "Business"],
    params: "businessId",
  },
  {
    path: "/api/businesses/admin/all",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin"],
  },

  // Business owner and admin routes
  {
    path: "/api/businesses",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Business"],
    body: (type: types) => ({
      name: `Test Business ${Math.random().toString(36).substring(7)}`,
      slogan: "Test business slogan",
    }),
  },
  {
    path: "/api/businesses/:businessId",
    method: "PUT",
    auth: true,
    allowedTypes: ["Business", "Admin"],
    params: "businessId",
    body: {
      name: "Updated Business",
    },
  },
  {
    path: "/api/businesses/:businessId",
    method: "DELETE",
    auth: true,
    allowedTypes: ["Business", "Admin"],
    params: "businessId",
  },

  // Admin only routes
  {
    path: "/api/businesses/:businessId/status",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin"],
    params: "businessId",
    body: {
      status: "approved",
    },
  },

  // Worker application routes
  {
    path: "/api/businesses/:businessId/apply",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Business"],
    params: "businessId",
  },
  {
    path: "/api/businesses/:businessId/workers/:workerId/handle",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Business"],
    params: "businessId",
    body: {
      action: "approve",
    },
  },
];

export const discountRoutes: route[] = [
  // Public routes (still need authentication)
  {
    path: "/api/discounts/business/:businessId",
    method: "GET",
    auth: true,
    allowedTypes: [
      "Admin",
      "Business",
      "Soldier",
      "Municipality",
      "Donor",
      "Organization",
    ],
    params: "businessId",
  },
  {
    path: "/api/discounts/:discountId",
    method: "GET",
    auth: true,
    allowedTypes: [
      "Admin",
      "Business",
      "Soldier",
      "Municipality",
      "Donor",
      "Organization",
    ],
    params: "discountId",
  },

  // Business owner and admin routes
  {
    path: "/api/discounts/business/:businessId",
    method: "POST",
    auth: true,
    allowedTypes: ["Business", "Admin"],
    params: "businessId",
    body: {
      name: "Test Discount",
      discount: "50% off",
      expireDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  },
  {
    path: "/api/discounts/business/:businessId/:discountId",
    method: "PUT",
    auth: true,
    allowedTypes: ["Business", "Admin"],
    params: "businessId",
    body: {
      name: "Updated Discount",
      discount: "75% off",
      expireDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
  },
  {
    path: "/api/discounts/business/:businessId/:discountId",
    method: "DELETE",
    auth: true,
    allowedTypes: ["Business", "Admin"],
    params: "businessId",
  },
];

export const donationRoutes: route[] = [
  // Get my donations
  {
    path: "/api/donations/my",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin", "Donor"],
  },

  // Create donation
  {
    path: "/api/donations",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Donor"],
    body: {
      title: "Test Donation",
      description: "Test donation description",
      category: "Furniture",
      address: "Test Address 123",
      city: getCitiesArray()[0]._id,
      media: ["http://example.com/image.jpg"],
    },
  },

  // Get all donations
  {
    path: "/api/donations",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin", "Municipality"],
  },

  // Get city donations and available soldiers
  {
    path: "/api/donations/city-matching",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin", "Municipality"],
  },

  // Get single donation
  {
    path: "/api/donations/:donationId",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin", "Municipality", "Donor", "Soldier"],
    params: "donationId",
  },

  // Update donation
  {
    path: "/api/donations/:donationId",
    method: "PUT",
    auth: true,
    allowedTypes: ["Admin", "Donor"],
    params: "donationId",
    body: {
      title: "Updated Donation",
      description: "Updated donation description",
      category: "Clothes",
      address: "Updated Address 123",
      media: ["http://example.com/new-image.jpg"],
    },
  },

  // Delete donation
  {
    path: "/api/donations/:donationId",
    method: "DELETE",
    auth: true,
    allowedTypes: ["Admin", "Donor"],
    params: "donationId",
  },

  // Assign donation to soldier
  {
    path: "/api/donations/:donationId/assign/:soldierId",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Municipality"],
    params: "donationId",
  },

  // Update donation status
  {
    path: "/api/donations/:donationId/status",
    method: "PUT",
    auth: true,
    allowedTypes: ["Admin", "Municipality", "Donor", "Soldier"],
    params: "donationId",
    body: {
      status: "assigned",
    },
  },
];

export const eatUpRoutes: route[] = [
  // Get all eatups (public but authenticated)
  {
    path: "/api/eatups",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin", "Municipality", "Organization", "Soldier"],
    query: ["city", "hosting", "date", "kosher", "page", "limit", "sort"],
  },

  // Get my eatups (created by the authenticated user)
  {
    path: "/api/eatups/my",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin", "Municipality", "Organization", "Donor"],
    query: ["page", "limit", "sort"],
  },

  // Get single eatup
  {
    path: "/api/eatups/:eatupId",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin", "Municipality", "Organization", "Donor", "Soldier"],
    params: "eatupId",
  },

  // Create eatup
  {
    path: "/api/eatups",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Municipality", "Organization", "Donor"],
    body: {
      city: getCitiesArray()[0]._id,
      title: "Test Eatup",
      media: ["http://example.com/image.jpg"],
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      kosher: true,
      description: "Test eatup description",
      languages: ["Hebrew", "English"],
      hosting: "organization",
      limit: 20,
    },
  },

  // Subscribe to eatup
  {
    path: "/api/eatups/:eatupId/subscribe",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Soldier"],
    params: "eatupId",
  },

  // Unsubscribe from eatup
  {
    path: "/api/eatups/:eatupId/unsubscribe",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Soldier"],
    params: "eatupId",
  },

  // Update eatup
  {
    path: "/api/eatups/:eatupId",
    method: "PUT",
    auth: true,
    allowedTypes: ["Admin", "Municipality", "Organization", "Donor"],
    params: "eatupId",
    body: {
      title: "Updated Eatup",
      description: "Updated eatup description",
      media: ["http://example.com/new-image.jpg"],
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      kosher: false,
      languages: ["English"],
      limit: 30,
    },
  },

  // Delete eatup
  {
    path: "/api/eatups/:eatupId",
    method: "DELETE",
    auth: true,
    allowedTypes: ["Admin", "Municipality", "Organization", "Donor"],
    params: "eatupId",
  },
];

export const requestRoutes: route[] = [
  // Get all requests (filtered by user role)
  {
    path: "/api/requests",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin", "Municipality", "Organization"],
  },

  // Get all requests by the authenticated user
  {
    path: "/api/requests/my",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin", "Soldier"],
  },

  // Get single request
  {
    path: "/api/requests/:requestId",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin", "Municipality", "Organization"],
    params: "requestId",
  },

  // Create request (only soldiers can create requests)
  {
    path: "/api/requests",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Soldier"],
    body: {
      title: "Test Request",
      description: "Test request description",
      category: "Furniture",
      city: getCitiesArray()[0]._id,
      media: ["http://example.com/image.jpg"],
    },
  },

  // Update request (author or admin only)
  {
    path: "/api/requests/:requestId",
    method: "PUT",
    auth: true,
    allowedTypes: ["Admin", "Soldier"],
    params: "requestId",
    body: {
      title: "Updated Request",
      description: "Updated request description",
      category: "Clothes",
      media: ["http://example.com/new-image.jpg"],
    },
  },

  // Approve request
  {
    path: "/api/requests/:requestId/approve",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Municipality"],
    params: "requestId",
  },

  // Deny request
  {
    path: "/api/requests/:requestId/deny",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Municipality"],
    params: "requestId",
  },

  // Pay for request
  {
    path: "/api/requests/:requestId/pay",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Donor", "Organization", "Municipality"],
    params: "requestId",
  },

  // Delete request (author or admin only)
  {
    path: "/api/requests/:requestId",
    method: "DELETE",
    auth: true,
    allowedTypes: ["Admin", "Soldier"],
    params: "requestId",
  },
];

export const profileRoutes: route[] = [
  // Get my profile
  {
    path: "/api/profiles/me",
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

  // Update my profile
  {
    path: "/api/profiles/me",
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
      nickname: "Test Nickname",
      bio: "Test bio description",
      profileImage: "http://example.com/image.jpg",
      visibility: "public",
    },
  },

  // Get profile by user ID
  {
    path: "/api/profiles/:userId",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin", "Municipality", "Organization", "Soldier"],
    params: "userId",
  },

  // Update user's profile (admin only)
  {
    path: "/api/profiles/:userId",
    method: "PUT",
    auth: true,
    allowedTypes: ["Admin"],
    params: "userId",
    body: {
      nickname: "Updated Nickname",
      bio: "Updated bio description",
      profileImage: "http://example.com/new-image.jpg",
      visibility: "private",
    },
  },
];

export const postRoutes: route[] = [
  // Create post
  {
    path: "/api/posts",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Soldier", "Municipality", "Organization"],
    body: {
      content: "Test post content",
      media: ["http://example.com/image.jpg"],
    },
  },

  // Get all posts
  {
    path: "/api/posts",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin", "Soldier", "Municipality", "Organization"],
  },

  // Get post by ID
  {
    path: "/api/posts/:postId",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin", "Soldier", "Municipality", "Organization"],
    params: "postId",
  },

  // Get posts by user ID
  {
    path: "/api/posts/user/:userId",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin", "Soldier", "Municipality", "Organization"],
    params: "userId",
  },

  // Toggle like on post
  {
    path: "/api/posts/:postId/like",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Soldier", "Municipality", "Organization"],
    params: "postId",
  },

  // Update post
  {
    path: "/api/posts/:postId",
    method: "PUT",
    auth: true,
    allowedTypes: ["Admin", "Soldier", "Municipality", "Organization"],
    params: "postId",
    body: {
      content: "Updated post content",
      media: ["http://example.com/new-image.jpg"],
    },
  },

  // Delete post
  {
    path: "/api/posts/:postId",
    method: "DELETE",
    auth: true,
    allowedTypes: ["Admin", "Soldier", "Municipality", "Organization"],
    params: "postId",
  },
];

export const commentRoutes: route[] = [
  // Get all comments (Admin only)
  {
    path: "/api/comments",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin"],
    query: ["page", "limit", "sort", "postId", "authorId"],
  },

  // Get comment by ID (Admin only)
  {
    path: "/api/comments/:commentId",
    method: "GET",
    auth: true,
    allowedTypes: ["Admin"],
    params: "commentId",
  },

  // Create comment (Admin, Soldier, Municipality, Organization)
  {
    path: "/api/comments",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Soldier", "Municipality", "Organization"],
    body: () => {
      const posts = getPostsArray();
      if (posts.length === 0) {
        throw new Error("No test post found");
      }
      return {
        postId: posts[0]._id,
        content: "Test comment content",
      };
    },
  },

  // Toggle like on comment (Admin, Soldier, Municipality, Organization)
  {
    path: "/api/comments/:commentId/like",
    method: "POST",
    auth: true,
    allowedTypes: ["Admin", "Soldier", "Municipality", "Organization"],
    params: "commentId",
  },

  // Update comment (Admin, Soldier, Municipality, Organization)
  {
    path: "/api/comments/:commentId",
    method: "PUT",
    auth: true,
    allowedTypes: ["Admin", "Soldier", "Municipality", "Organization"],
    params: "commentId",
    body: {
      content: "Updated comment content",
    },
  },

  // Delete comment (Admin, Soldier, Municipality, Organization)
  {
    path: "/api/comments/:commentId",
    method: "DELETE",
    auth: true,
    allowedTypes: ["Admin", "Soldier", "Municipality", "Organization"],
    params: "commentId",
  },
];
