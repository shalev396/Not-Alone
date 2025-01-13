import request from "supertest";
import { app } from "../../src/index";
import { User } from "../../src/models/User";
import { createTestUser, createAdminUser, generateTestToken } from "../helpers";
import { setupTestDB } from "../setup";

describe("Admin Routes", () => {
  setupTestDB();

  let adminUser: any;
  let adminToken: string;
  let testUser: any;

  beforeEach(async () => {
    adminUser = await createAdminUser();
    testUser = await createTestUser({ approvalStatus: "pending" });
    adminToken = generateTestToken(adminUser._id.toString(), "Admin");
  });

  describe("GET /api/users/all", () => {
    it("should get all users as admin", async () => {
      const res = await request(app)
        .get("/api/users/all")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("users");
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBe(2); // admin + test user
    });

    it("should fail for non-admin users", async () => {
      const userToken = generateTestToken(testUser._id.toString());
      const res = await request(app)
        .get("/api/users/all")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("GET /api/users/pending", () => {
    it("should get pending users as admin", async () => {
      const res = await request(app)
        .get("/api/users/pending")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("users");
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBe(1); // only test user is pending
    });
  });

  describe("POST /api/users/approve/:id", () => {
    it("should approve a pending user", async () => {
      const res = await request(app)
        .post(`/api/users/approve/${testUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.approvalStatus).toBe("approved");
    });

    it("should fail for already approved user", async () => {
      await User.findByIdAndUpdate(testUser._id, {
        approvalStatus: "approved",
      });

      const res = await request(app)
        .post(`/api/users/approve/${testUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("POST /api/users/deny/:id", () => {
    it("should deny a pending user", async () => {
      const res = await request(app)
        .post(`/api/users/deny/${testUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: "Invalid documentation" });

      expect(res.status).toBe(200);
      expect(res.body.user.approvalStatus).toBe("denied");
      expect(res.body.user.denialReason).toBe("Invalid documentation");
    });

    it("should fail without denial reason", async () => {
      const res = await request(app)
        .post(`/api/users/deny/${testUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete a user as admin", async () => {
      const res = await request(app)
        .delete(`/api/users/${testUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");

      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser).toBeNull();
    });

    it("should fail for non-admin users", async () => {
      const userToken = generateTestToken(testUser._id.toString());
      const res = await request(app)
        .delete(`/api/users/${testUser._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });
  });
});
