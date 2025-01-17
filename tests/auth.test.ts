import request from "supertest";
import { app } from "../src/index";
import mongoose from "mongoose";
import {
  getUsersArray,
  types,
  clearUsers,
  users,
  setUsersArray,
} from "./userHelper";
import { getCitiesArray } from "./cityHelper";
import { getDonationsArray } from "./donationHelper";
import { UserModel } from "../src/models/userModel";
import {
  authRoutes,
  userRoutes,
  cityRoutes,
  businessRoutes,
  discountRoutes,
  donationRoutes,
} from "./routes";

// Increase timeout for all tests in this file
jest.setTimeout(30000);

describe("Route Access Tests", () => {
  const allRoutes = [
    ...authRoutes,
    ...userRoutes,
    ...cityRoutes,
    ...businessRoutes,
    ...discountRoutes,
    ...donationRoutes,
  ];
  let users: users[];

  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/not-alone-test"
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Clear database and users.json
    // await UserModel.deleteMany({});
    // await clearUsers();

    const usersToSave: users[] = [];

    // First register admin user with auto-approval
    const adminData = {
      firstName: "Test",
      lastName: "Admin",
      passport: Math.floor(Math.random() * 1000000000).toString(),
      email: `testadmin${Math.random().toString(36).substring(7)}@example.com`,
      password: "Test123!@#",
      phone: `05012345${Math.floor(Math.random() * 1000)}`,
      type: "Admin" as types,
      approvalStatus: "approved",
    };

    const registerAdminResponse = await request(app)
      .post("/api/auth/register")
      .send(adminData);

    if (registerAdminResponse.status !== 201) {
      throw new Error("Failed to register admin user");
    }

    // console.log("Admin registration response:", registerAdminResponse.body);
    const adminId = registerAdminResponse.body.user._id;

    // Login admin to get token
    const adminLoginResponse = await request(app).post("/api/auth/login").send({
      email: adminData.email,
      password: "Test123!@#",
    });

    if (adminLoginResponse.status === 200 && adminLoginResponse.body.token) {
      usersToSave.push({
        type: "Admin",
        email: adminData.email,
        password: "Test123!@#",
        token: adminLoginResponse.body.token,
        id: adminId,
      });
    } else {
      // console.log("Admin login failed:", adminLoginResponse.body);
    }

    // Register other users
    const userTypes: types[] = [
      "Soldier",
      "Municipality",
      "Donor",
      "Organization",
      "Business",
    ];

    for (const type of userTypes) {
      // Register user
      const userData = {
        firstName: "Test",
        lastName: type,
        passport: Math.floor(Math.random() * 1000000000).toString(),
        email: `test${type.toLowerCase()}${Math.random()
          .toString(36)
          .substring(7)}@example.com`,
        password: "Test123!@#",
        phone: `05012345${Math.floor(Math.random() * 1000)}`,
        type: type,
      };

      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send(userData);

      if (registerResponse.status !== 201) {
        // console.log(`Failed to register ${type}:`, registerResponse.body);
        throw new Error(`Failed to register ${type} user`);
      }

      // console.log(`${type} registration response:`, registerResponse.body);
      const userId = registerResponse.body.user._id;

      // Approve user using admin token
      const approveResponse = await request(app)
        .post(`/api/users/approve/${userId}`)
        .set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

      // console.log(`${type} approve response:`, approveResponse.body);

      if (approveResponse.status !== 200) {
        // console.log(`Failed to approve ${type}:`, approveResponse.body);
      }

      // Login and get token
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: userData.email,
        password: "Test123!@#",
      });

      if (loginResponse.status === 200 && loginResponse.body.token) {
        // Store user data and token
        usersToSave.push({
          type: type,
          email: userData.email,
          password: "Test123!@#",
          token: loginResponse.body.token,
          id: userId,
        });
      } else {
        // console.log(`${type} login failed:`, loginResponse.body);
      }
    }

    // Save all users to users.json
    setUsersArray(usersToSave);

    // Get all users for testing
    users = getUsersArray();
  });

  afterAll(async () => {
    await clearUsers();
    await mongoose.connection.close();
  });

  describe("Route Access Control", () => {
    // Test each route
    allRoutes.forEach((route) => {
      describe(`${route.method} ${route.path}`, () => {
        // For each route, test access for each user type
        test.each(route.allowedTypes)(
          `should allow access for %s`,
          async (userType) => {
            const user = users.find((u) => u.type === userType);
            if (!user) {
              throw new Error(
                `User of type ${userType} not found in users.json`
              );
            }

            // Replace route parameters with actual values
            let path = route.path;
            if (route.params) {
              // For city routes, use the city ID from cities.json
              if (path.includes("/api/cities/")) {
                const cities = getCitiesArray();
                if (cities.length === 0) {
                  throw new Error("No test city found in cities.json");
                }
                const cityId = cities[0]._id;
                const paramPattern = `:${route.params}`;
                path = path.split(paramPattern).join(cityId);
              }
              // For donation routes, use the donation ID from donations.json
              else if (path.includes("/api/donations/")) {
                const donations = getDonationsArray();
                if (donations.length === 0) {
                  throw new Error("No test donation found in donations.json");
                }
                const donationId = donations[0]._id;
                const paramPattern = `:donationId`;
                path = path.split(paramPattern).join(donationId);
                // Handle soldier assignment route
                if (path.includes("/assign/:soldierId")) {
                  const soldierUser = users.find((u) => u.type === "Soldier");
                  if (!soldierUser) throw new Error("No test soldier found");
                  const soldierPattern = `:soldierId`;
                  path = path.split(soldierPattern).join(soldierUser.id);
                }
              } else {
                // For admin operations on users, use a Soldier user's ID
                const targetUser =
                  userType === "Admin"
                    ? users.find((u) => u.type === "Soldier")
                    : users.find((u) => u.type === userType);
                if (!targetUser) throw new Error("No test user found");
                const paramPattern = `:${route.params}`;
                path = path.split(paramPattern).join(targetUser.id);
              }
            }

            // Prepare request
            const method = route.method.toLowerCase() as
              | "get"
              | "post"
              | "put"
              | "delete";
            let req = request(app)[method](path);

            // Add authorization header if needed
            if (route.auth) {
              req = req.set("Authorization", `Bearer ${user.token}`);
            }

            // Add query parameters if needed
            if (route.query) {
              const queryParams = route.query.reduce((acc, param) => {
                acc[param] = "test";
                return acc;
              }, {} as Record<string, string>);
              req = req.query(queryParams);
            }

            // Add body data if needed
            if (route.body) {
              const bodyData =
                typeof route.body === "function"
                  ? route.body(userType)
                  : { ...route.body }; // Clone the object to avoid mutations
              req = req.send(bodyData);
            }

            const response = await req;

            // We expect success status codes for allowed types

            expect([200, 201, 202, 204, 400, 404]).toContain(response.status);
          }
        );

        // Test that non-allowed types cannot access the route
        const nonAllowedTypes = [
          "Admin",
          "Soldier",
          "Municipality",
          "Donor",
          "Organization",
          "Business",
        ].filter((type) => !route.allowedTypes.includes(type as types));

        if (nonAllowedTypes.length > 0 && route.auth) {
          test.each(nonAllowedTypes)(
            `should deny access for %s`,
            async (userType) => {
              const user = users.find((u) => u.type === userType);
              if (!user) {
                throw new Error(
                  `User of type ${userType} not found in users.json`
                );
              }

              // Replace route parameters with actual values
              let path = route.path;
              if (route.params) {
                // For city routes, use the city ID from cities.json
                if (path.includes("/api/cities/")) {
                  const cities = getCitiesArray();
                  if (cities.length === 0) {
                    throw new Error("No test city found in cities.json");
                  }
                  const cityId = cities[0]._id;
                  const paramPattern = `:${route.params}`;
                  path = path.split(paramPattern).join(cityId);
                } else {
                  // For admin operations on users, use a Soldier user's ID
                  const targetUser =
                    userType === "Admin"
                      ? users.find((u) => u.type === "Soldier")
                      : users.find((u) => u.type === userType);
                  if (!targetUser) throw new Error("No test user found");
                  const paramPattern = `:${route.params}`;
                  path = path.split(paramPattern).join(targetUser.id);
                }
              }

              // Prepare request
              const method = route.method.toLowerCase() as
                | "get"
                | "post"
                | "put"
                | "delete";
              let req = request(app)[method](path);

              // Add authorization header if needed
              if (route.auth) {
                req = req.set("Authorization", `Bearer ${user.token}`);
              }

              // Add query parameters if needed
              if (route.query) {
                const queryParams = route.query.reduce((acc, param) => {
                  acc[param] = "test";
                  return acc;
                }, {} as Record<string, string>);
                req = req.query(queryParams);
              }

              // Add body data if needed
              if (route.body) {
                const bodyData =
                  typeof route.body === "function"
                    ? route.body(userType as types)
                    : route.body;
                req = req.send(bodyData);
              }

              const response = await req;

              // For non-allowed types, we expect either 401 or 403
              expect([401, 403]).toContain(response.status);
            }
          );
        }
      });
    });
  });
});
