import React, { useEffect, useState } from "react";
import { api } from "@/api/api";

type Voucher = {
  id: string;
  title: string;
  description: string;
  discount: number;
  expiryDate: string;
};

const VouchersGrid: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/vouchers");
        setVouchers(response.data);
      } catch (err) {
        console.error("Error fetching vouchers:", err);
        setError("Failed to load vouchers");
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  if (loading) return <div>Loading vouchers...</div>;
  if (error) return <div>{error}</div>;
  console.log(vouchers);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {vouchers.map((voucher) => (
        <div
          key={voucher.id}
          className="bg-white shadow-md rounded-lg p-4 border hover:shadow-lg"
        >
          <h2 className="text-lg font-semibold">{voucher.title}</h2>
          <p className="text-sm text-gray-600">{voucher.description}</p>
          <p className="text-green-600 font-bold">
            Discount: {voucher.discount}%
          </p>
          <p className="text-red-500 text-sm">
            Expires on: {new Date(voucher.expiryDate).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default VouchersGrid;
