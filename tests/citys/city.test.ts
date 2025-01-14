import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../src/index";
import { UserModel } from "../../src/models/userModel";
import { CityModel } from "../../src/models/cityModel";
import { generateToken } from "../../src/utils/auth";
import { User } from "../../src/types/user";
import { City } from "../../src/types/city";

describe("City API", () => {
  let admin: User & { _id: mongoose.Types.ObjectId };
  let municipality: User & { _id: mongoose.Types.ObjectId };
  let soldier: User & { _id: mongoose.Types.ObjectId };
  let city: City & { _id: mongoose.Types.ObjectId };
  let adminToken: string;
  let municipalityToken: string;
  let soldierToken: string;

  beforeAll(async () => {
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/not-alone-test";
    await mongoose.connect(MONGODB_URI);
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await CityModel.deleteMany({});

    // Create test users
    admin = (await UserModel.create({
      email: "admin@test.com",
      password: "password123",
      firstName: "Admin",
      lastName: "User",
      phone: "+972501234567",
      passport: "AB123456",
      type: "Admin",
      approvalStatus: "approved",
    })) as User & { _id: mongoose.Types.ObjectId };

    municipality = (await UserModel.create({
      email: "municipality@test.com",
      password: "password123",
      firstName: "Municipality",
      lastName: "User",
      phone: "+972501234568",
      passport: "AB123457",
      type: "Municipality",
      approvalStatus: "approved",
    })) as User & { _id: mongoose.Types.ObjectId };

    soldier = (await UserModel.create({
      email: "soldier@test.com",
      password: "password123",
      firstName: "Soldier",
      lastName: "User",
      phone: "+972501234569",
      passport: "AB123458",
      type: "Soldier",
      approvalStatus: "approved",
    })) as User & { _id: mongoose.Types.ObjectId };

    // Generate tokens
    adminToken = generateToken(admin._id.toString());
    municipalityToken = generateToken(municipality._id.toString());
    soldierToken = generateToken(soldier._id.toString());

    // Create a test city
    city = (await CityModel.create({
      name: "Test City",
      zone: "north",
      bio: "A test city",
      approvalStatus: "approved",
    })) as City & { _id: mongoose.Types.ObjectId };
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /api/cities", () => {
    it("should return all approved cities", async () => {
      const res = await request(app).get("/api/cities");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("Test City");
    });
  });

  describe("POST /api/cities", () => {
    it("should create a new city when admin", async () => {
      const res = await request(app)
        .post("/api/cities")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "New City",
          zone: "south",
          bio: "A new test city",
        });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe("New City");
      expect(res.body.approvalStatus).toBe("pending");
    });

    it("should not allow duplicate city names", async () => {
      const res = await request(app)
        .post("/api/cities")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test City",
          zone: "center",
          bio: "Another test city",
        });
      expect(res.status).toBe(400);
    });

    it("should not allow invalid zone values", async () => {
      const res = await request(app)
        .post("/api/cities")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Invalid Zone City",
          zone: "invalid",
          bio: "A city with invalid zone",
        });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/cities/:cityId/join/municipality", () => {
    it("should allow municipality to join city", async () => {
      const res = await request(app)
        .post(`/api/cities/${city._id}/join/municipality`)
        .set("Authorization", `Bearer ${municipalityToken}`);
      expect(res.status).toBe(200);
      const updatedCity = await CityModel.findById(city._id);
      expect(updatedCity?.municipalityUsers).toContainEqual(municipality._id);
    });

    it("should not allow non-municipality users to join", async () => {
      const res = await request(app)
        .post(`/api/cities/${city._id}/join/municipality`)
        .set("Authorization", `Bearer ${soldierToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/cities/:cityId/join/soldier", () => {
    it("should allow soldier to join city", async () => {
      const res = await request(app)
        .post(`/api/cities/${city._id}/join/soldier`)
        .set("Authorization", `Bearer ${soldierToken}`);
      expect(res.status).toBe(200);
      const updatedCity = await CityModel.findById(city._id);
      expect(updatedCity?.soldiers).toContainEqual(soldier._id);
    });

    it("should not allow non-soldier users to join", async () => {
      const res = await request(app)
        .post(`/api/cities/${city._id}/join/soldier`)
        .set("Authorization", `Bearer ${municipalityToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/cities/:cityId", () => {
    it("should allow admin to update city", async () => {
      const res = await request(app)
        .patch(`/api/cities/${city._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated City",
          zone: "center",
          bio: "Updated bio",
        });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Updated City");
      expect(res.body.zone).toBe("center");
    });

    it("should allow municipality user to update their city", async () => {
      // First add municipality user to city
      await CityModel.findByIdAndUpdate(city._id, {
        $push: { municipalityUsers: municipality._id },
      });

      const res = await request(app)
        .patch(`/api/cities/${city._id}`)
        .set("Authorization", `Bearer ${municipalityToken}`)
        .send({
          bio: "Updated by municipality",
        });
      expect(res.status).toBe(200);
      expect(res.body.bio).toBe("Updated by municipality");
    });

    it("should not allow unauthorized users to update city", async () => {
      const res = await request(app)
        .patch(`/api/cities/${city._id}`)
        .set("Authorization", `Bearer ${soldierToken}`)
        .send({
          bio: "Unauthorized update",
        });
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/cities/:cityId/approve", () => {
    it("should allow admin to approve city", async () => {
      // First create a pending city
      const pendingCity = await CityModel.create({
        name: "Pending City",
        zone: "north",
        bio: "A pending city",
      });

      const res = await request(app)
        .post(`/api/cities/${pendingCity._id}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.approvalStatus).toBe("approved");
      expect(res.body.approvalDate).toBeDefined();
    });

    it("should not allow non-admin users to approve city", async () => {
      const res = await request(app)
        .post(`/api/cities/${city._id}/approve`)
        .set("Authorization", `Bearer ${municipalityToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/cities/:cityId/deny", () => {
    it("should allow admin to deny city", async () => {
      const res = await request(app)
        .post(`/api/cities/${city._id}/deny`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: "Not suitable" });
      expect(res.status).toBe(200);
      expect(res.body.approvalStatus).toBe("denied");
      expect(res.body.denialReason).toBe("Not suitable");
    });

    it("should not allow non-admin users to deny city", async () => {
      const res = await request(app)
        .post(`/api/cities/${city._id}/deny`)
        .set("Authorization", `Bearer ${municipalityToken}`)
        .send({ reason: "Not suitable" });
      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/cities/:cityId", () => {
    it("should allow admin to delete city", async () => {
      const res = await request(app)
        .delete(`/api/cities/${city._id}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      const deletedCity = await CityModel.findById(city._id);
      expect(deletedCity).toBeNull();
    });

    it("should not allow non-admin users to delete city", async () => {
      const res = await request(app)
        .delete(`/api/cities/${city._id}`)
        .set("Authorization", `Bearer ${municipalityToken}`);
      expect(res.status).toBe(403);
    });
  });
});
