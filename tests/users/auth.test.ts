import request from "supertest";
import { app } from "../../src/index";
import { User } from "../../src/models/User";
import { setupTestDB } from "../setup";

describe("Authentication Endpoints", () => {
  setupTestDB();

  describe("POST /api/users/register", () => {
    const validUser = {
      email: "test@example.com",
      password: "Password123",
      firstName: "Test",
      lastName: "User",
      phone: "+1234567890",
      passport: "AB123456",
      type: "Soldier",
    };

    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/users/register")
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(validUser.email.toLowerCase());
      expect(res.body.user.approvalStatus).toBe("pending");
    });

    it("should fail with invalid email", async () => {
      const res = await request(app)
        .post("/api/users/register")
        .send({ ...validUser, email: "invalid-email" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should fail with weak password", async () => {
      const res = await request(app)
        .post("/api/users/register")
        .send({ ...validUser, password: "123" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should fail with duplicate email", async () => {
      await request(app).post("/api/users/register").send(validUser);

      const res = await request(app)
        .post("/api/users/register")
        .send(validUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("POST /api/users/login", () => {
    const user = {
      email: "test@example.com",
      password: "Password123",
      firstName: "Test",
      lastName: "User",
      phone: "+1234567890",
      passport: "AB123456",
      type: "Soldier",
    };
//TODO: fix so this wont be posable approvalStatus: "approved",
    beforeEach(async () => {
      // Create a user before each login test
      await User.create({
        ...user,
        approvalStatus: "approved",
      });
    });

    it("should login successfully with valid credentials", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: user.email,
        password: user.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(user.email);
    });

    it("should fail with incorrect password", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: user.email,
        password: "wrongpassword",
      });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    it("should fail with non-existent email", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: "nonexistent@example.com",
        password: user.password,
      });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    it("should fail with invalid email format", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: "invalid-email",
        password: user.password,
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should fail with pending approval status", async () => {
      await User.findOneAndUpdate(
        { email: user.email },
        { approvalStatus: "pending" }
      );

      const res = await request(app).post("/api/users/login").send({
        email: user.email,
        password: user.password,
      });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error", "Account not approved");
      expect(res.body).toHaveProperty("status", "pending");
    });
  });
});
