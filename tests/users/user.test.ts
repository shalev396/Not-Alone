import request from "supertest";
import { app } from "../../src/index";
import { User } from "../../src/models/User";
import { createTestUser, createAdminUser, generateTestToken } from "../helpers";
import { setupTestDB } from "../setup";

describe("User Routes", () => {
  setupTestDB();

  let testUser: any;
  let authToken: string;
  let adminUser: any;

  beforeEach(async () => {
    testUser = await createTestUser({ approvalStatus: "approved" });
    adminUser = await createAdminUser();
    authToken = generateTestToken(testUser._id.toString(), testUser.type);
  });

  describe("GET /api/users/me", () => {
    it("should get current user profile", async () => {
      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(testUser.email);
    });

    it("should fail without auth token", async () => {
      const res = await request(app).get("/api/users/me");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("PUT /api/users/me", () => {
    it("should update current user profile", async () => {
      const updateData = {
        firstName: "Updated",
        lastName: "Name",
        phone: "+9876543210",
      };

      const res = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.user.firstName).toBe(updateData.firstName);
      expect(res.body.user.lastName).toBe(updateData.lastName);
      expect(res.body.user.phone).toBe(updateData.phone);
    });

    it("should fail with invalid phone format", async () => {
      const res = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ phone: "123" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should fail without auth token", async () => {
      const res = await request(app)
        .put("/api/users/me")
        .send({ firstName: "Updated" });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("GET /api/users/:id", () => {
    it("should get user by id with proper permissions", async () => {
      const adminToken = generateTestToken(adminUser._id.toString(), "Admin");
      const res = await request(app)
        .get(`/api/users/${testUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(testUser.email);
    });

    it("should fail with invalid user id", async () => {
      const adminToken = generateTestToken(adminUser._id.toString(), "Admin");
      const res = await request(app)
        .get("/api/users/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });
});
