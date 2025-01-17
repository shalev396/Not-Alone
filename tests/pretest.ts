import mongoose from "mongoose";
import request from "supertest";
import { app } from "../src/index";
import {
  getUsersArray,
  setUsersArray,
  clearUsers,
  types,
  users,
} from "./userHelper";
import {
  getCitiesArray,
  setCitiesArray,
  clearCities,
  city,
} from "./cityHelper";
import {
  getBusinessesArray,
  setBusinessesArray,
  clearBusinesses,
  business,
} from "./bussinessHelper";
import { UserModel } from "../src/models/userModel";
import { CityModel } from "../src/models/cityModel";
import { BusinessModel } from "../src/models/businessModel";
import { clearDiscounts, setDiscountsArray } from "./discountHelper";
import { DiscountModel } from "../src/models/discountModel";
import { clearDonations, setDonationsArray } from "./donationHelper";
import { DonationModel } from "../src/models/donationModel";
import { clearEatup, setEatupArray } from "./eatupHelper";
import { EatupModel } from "../src/models/eatupModel";
import { clearRequests, setRequestsArray } from "./requestHelper";
import { RequestModel } from "../src/models/requestModel";

const testUsers = [
  {
    type: "Admin" as types,
    firstName: "Test",
    lastName: "Admin",
    email: "testadmin@example.com",
    password: "Test123!@#",
    phone: "+972501234567",
    passport: "123456789",
    approvalStatus: "approved",
    preferences: {
      language: "en",
      notifications: false,
    },
  },
  {
    type: "Soldier" as types,
    firstName: "Test",
    lastName: "Soldier",
    email: "testsoldier@example.com",
    password: "Test123!@#",
    phone: "+972501234568",
    passport: "123456790",
    preferences: {
      language: "en",
      notifications: false,
    },
  },
  {
    type: "Municipality" as types,
    firstName: "Test",
    lastName: "Municipality",
    email: "testmunicipality@example.com",
    password: "Test123!@#",
    phone: "+972501234569",
    passport: "123456791",
    preferences: {
      language: "en",
      notifications: false,
    },
  },
  {
    type: "Donor" as types,
    firstName: "Test",
    lastName: "Donor",
    email: "testdonor@example.com",
    password: "Test123!@#",
    phone: "+972501234570",
    passport: "123456792",
    preferences: {
      language: "en",
      notifications: false,
    },
  },
  {
    type: "Organization" as types,
    firstName: "Test",
    lastName: "Organization",
    email: "testorganization@example.com",
    password: "Test123!@#",
    phone: "+972501234571",
    passport: "123456793",
    preferences: {
      language: "en",
      notifications: false,
    },
  },
  {
    type: "Business" as types,
    firstName: "Test",
    lastName: "Business",
    email: "testbusiness@example.com",
    password: "Test123!@#",
    phone: "+972501234572",
    passport: "123456794",
    preferences: {
      language: "en",
      notifications: false,
    },
  },
];

const setupTestUsers = async () => {
  try {
    // Clear existing users, cities, and businesses
    clearUsers();
    clearCities();
    clearBusinesses();
    clearDiscounts();
    clearDonations();
    clearEatup();
    clearRequests();
    await UserModel.deleteMany({});
    await CityModel.deleteMany({});
    await BusinessModel.deleteMany({});
    await DiscountModel.deleteMany({});
    await DonationModel.deleteMany({});
    await EatupModel.deleteMany({});
    await RequestModel.deleteMany({});

    // Create users array for userHelper
    const usersForJson = testUsers.map((user) => ({
      type: user.type,
      email: user.email,
      password: user.password,
    }));
    setUsersArray(usersForJson);

    // First register admin
    const adminUser = testUsers[0];
    const registerAdminResponse = await request(app)
      .post("/api/auth/register")
      .send(adminUser);

    if (registerAdminResponse.status !== 201) {
      throw new Error("Failed to register admin user");
    }

    // Login as admin to get token
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: adminUser.email,
      password: adminUser.password,
    });

    if (adminLogin.status !== 200 || !adminLogin.body.token) {
      throw new Error("Failed to login as admin");
    }

    const adminToken = adminLogin.body.token;

    // Update users.json with admin token and ID
    const users = getUsersArray();
    const jsonAdminUser = users.find(
      (u: { type: types }) => u.type === "Admin"
    );
    if (jsonAdminUser) {
      jsonAdminUser.email = adminUser.email;
      jsonAdminUser.password = adminUser.password;
      jsonAdminUser.token = adminToken;
      jsonAdminUser.id = registerAdminResponse.body.user._id;
      setUsersArray(users);
    }

    // Register other users
    for (const user of testUsers.slice(1)) {
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send(user);

      if (registerResponse.status !== 201) {
        throw new Error(`Failed to register ${user.type} user`);
      }

      const userId = registerResponse.body.user._id;

      // Approve user using admin token
      const approveResponse = await request(app)
        .post(`/api/users/approve/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      if (approveResponse.status !== 200) {
        throw new Error(`Failed to approve ${user.type} user`);
      }

      // Login user to get token
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: user.email,
        password: user.password,
      });

      if (loginResponse.status !== 200 || !loginResponse.body.token) {
        throw new Error(`Failed to login as ${user.type}`);
      }

      // Update user in users.json
      const updatedUsers = getUsersArray();
      const jsonUser = updatedUsers.find((u: users) => u.email === user.email);
      if (jsonUser) {
        jsonUser.email = user.email;
        jsonUser.password = user.password;
        jsonUser.token = loginResponse.body.token;
        jsonUser.id = userId;
        setUsersArray(updatedUsers);
      }
    }

    // Create a test city using Municipality user
    const municipalityUser = getUsersArray().find(
      (u: users) => u.type === "Municipality"
    );
    if (!municipalityUser || !municipalityUser.token) {
      throw new Error("Municipality user not found or not logged in");
    }

    const cityData = {
      name: "Test City",
      zone: "north",
      bio: "Test city description",
    };

    const createCityResponse: any = await request(app)
      .post("/api/cities")
      .set("Authorization", `Bearer ${municipalityUser.token}`)
      .send(cityData);

    if (createCityResponse.status !== 201) {
      throw new Error("Failed to create test city");
    }

    // Approve the city using admin token
    // console.log(createCityResponse._body._id);
    //do not touch this
    const cityId = createCityResponse._body._id;
    await request(app)
      .post(`/api/cities/${cityId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);

    // Store city in cities.json
    const cityToSave: city = createCityResponse._body;
    setCitiesArray([cityToSave]);

    // Create a test business using Business user
    const businessUser = getUsersArray().find(
      (u: users) => u.type === "Business"
    );
    if (!businessUser || !businessUser.token) {
      throw new Error("Business user not found or not logged in");
    }

    const businessData = {
      name: "Test Business",
      slogan: "Test business slogan",
    };

    const createBusinessResponse: any = await request(app)
      .post("/api/businesses")
      .set("Authorization", `Bearer ${businessUser.token}`)
      .send(businessData);

    if (createBusinessResponse.status !== 201) {
      throw new Error("Failed to create test business");
    }

    // Approve the business using admin token
    const businessId = createBusinessResponse.body._id;
    await request(app)
      .post(`/api/businesses/${businessId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "approved" });

    // Store business in businesses.json
    const businessToSave: business = {
      ...createBusinessResponse.body,
    };
    setBusinessesArray([businessToSave]);

    // Create a test discount for the business
    const discountData = {
      name: "Test Discount",
      discount: "50% off",
      expireDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    const createDiscountResponse: any = await request(app)
      .post(`/api/discounts/business/${businessId}`)
      .set("Authorization", `Bearer ${businessUser.token}`)
      .send(discountData);

    if (createDiscountResponse.status !== 201) {
      throw new Error("Failed to create test discount");
    }

    // Store discount in discounts.json
    const discountToSave = {
      ...createDiscountResponse.body,
      businessId: businessId,
    };
    setDiscountsArray([discountToSave]);

    // Create a test donation using Donor user
    const donorUser = getUsersArray().find((u: users) => u.type === "Donor");
    if (!donorUser || !donorUser.token) {
      throw new Error("Donor user not found or not logged in");
    }

    const donationData = {
      title: "Test Donation",
      description: "Test donation description",
      category: "Furniture",
      address: "Test Address 123",
      city: cityId,
      media: ["http://example.com/image.jpg"],
    };

    const createDonationResponse: any = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${donorUser.token}`)
      .send(donationData);

    if (createDonationResponse.status !== 201) {
      throw new Error("Failed to create test donation");
    }

    // Store donation in donations.json
    const donationToSave = {
      ...createDonationResponse.body,
      donorId: donorUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDonationsArray([donationToSave]);

    // Create a test eatup using Organization user
    const organizationUser = getUsersArray().find(
      (u: users) => u.type === "Organization"
    );
    if (!organizationUser || !organizationUser.token) {
      throw new Error("Organization user not found or not logged in");
    }

    const eatupData = {
      city: cityId,
      title: "Test Eatup",
      media: ["http://example.com/image.jpg"],
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      kosher: true,
      description: "Test eatup description for testing purposes",
      languages: ["Hebrew", "English"],
      hosting: "organization",
      limit: 20,
    };

    const createEatupResponse: any = await request(app)
      .post("/api/eatups")
      .set("Authorization", `Bearer ${organizationUser.token}`)
      .send(eatupData);

    if (createEatupResponse.status !== 201) {
      throw new Error("Failed to create test eatup");
    }

    // Store eatup in eatup.json
    const eatupToSave = {
      ...createEatupResponse.body,
      authorId: organizationUser.id,
      guests: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setEatupArray([eatupToSave]);

    // Create a test request using Soldier user
    const soldierUser = getUsersArray().find(
      (u: users) => u.type === "Soldier"
    );
    if (!soldierUser || !soldierUser.token) {
      throw new Error("Soldier user not found or not logged in");
    }

    const requestData = {
      service: "Regular",
      item: "Test Item",
      itemDescription: "Test item description",
      quantity: 1,
      zone: "north",
      city: cityId,
      agreeToShareDetails: true,
    };

    const createRequestResponse: any = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${soldierUser.token}`)
      .send(requestData);

    if (createRequestResponse.status !== 201) {
      console.error("Request creation failed:", createRequestResponse.body);
      throw new Error("Failed to create test request");
    }

    // Store request in request.json
    const requestToSave = {
      ...createRequestResponse.body,
      authorId: soldierUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setRequestsArray([requestToSave]);

    console.log("Test users setup completed successfully");
  } catch (error) {
    console.error("Error setting up test users:", error);
    throw error;
  }
};

// Export setup function for Jest
export default async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/not-alone-test"
    );
    await setupTestUsers();
    await mongoose.connection.close();
  } catch (error) {
    console.error("Setup failed:", error);
    throw error;
  }
};
