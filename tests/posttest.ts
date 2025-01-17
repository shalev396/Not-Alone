import mongoose from "mongoose";
import { clearUsers } from "./userHelper";
import { clearCities } from "./cityHelper";
import { clearBusinesses } from "./bussinessHelper";
import { clearDiscounts } from "./discountHelper";
import { clearDonations } from "./donationHelper";
import { clearEatup } from "./eatupHelper";
import { clearRequests } from "./requestHelper";
import { clearProfile } from "./profileHelper";

const cleanup = async () => {
  try {
    // Clear users.json
    clearUsers();
    clearCities();
    clearBusinesses();
    clearDiscounts();
    clearDonations();
    clearEatup();
    clearRequests();
    clearProfile();

    // Drop all collections
    // Drop all collections
    if (mongoose.connection.readyState === 1) {
      const collections = await mongoose.connection.db?.collections();
      if (collections) {
        for (const collection of collections) {
          try {
            await collection.drop();
          } catch (error: any) {
            // Ignore collection doesn't exist errors
            if (error.code !== 26) {
              console.error(
                `Error dropping collection ${collection.collectionName}:`,
                error
              );
            }
          }
        }
      }
    }

    console.log("Test cleanup completed successfully");
  } catch (error) {
    console.error("Error during cleanup:", error);
    throw error;
  }
};

// Export cleanup function for Jest
export default async () => {
  try {
    // Connect to test database
    await mongoose.connect(
      process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/not-alone-test"
    );

    // Perform cleanup
    await cleanup();

    // Close connection
    await mongoose.connection.close();

    // Ensure all connections are closed
    await mongoose.disconnect();
  } catch (error) {
    console.error("Cleanup failed:", error);
    throw error;
  }
};
