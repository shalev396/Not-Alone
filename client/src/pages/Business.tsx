import { api } from "@/api/api";
import { useEffect, useState } from "react";

interface IBusiness {
  _id: string;
  name: string;
  slogan: string;
  status: "pending" | "approved" | "denied";
}

const BusinessPage = () => {
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await api.get("/businesses");
        setBusinesses(response.data);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    };

    fetchBusinesses();
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-semibold mb-6 text-gray-900">
        Business Page
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {businesses.map((business) => (
          <div
            key={business._id}
            className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700"
          >
            <h2 className="text-2xl font-semibold text-green-500">
              {business.name}
            </h2>
            <p className="text-gray-300 mt-2">{business.slogan}</p>
            <p
              className={`mt-2 ${
                business.status === "approved"
                  ? "text-green-400"
                  : "text-red-500"
              }`}
            >
              {business.status.toUpperCase()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessPage;
