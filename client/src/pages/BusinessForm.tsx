import { useState } from "react";

interface IBusinessFormProps {
  onSubmit: (business: {
    name: string;
    slogan: string;
    status: "pending" | "approved" | "denied";
  }) => void;
}

const BusinessForm = ({ onSubmit }: IBusinessFormProps) => {
  const [name, setName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [status, setStatus] = useState<"pending" | "approved" | "denied">(
    "pending"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slogan) return; // Make sure both fields are filled out
    onSubmit({ name, slogan, status });
    setName(""); // Reset form fields
    setSlogan("");
  };

  return (
    <div className="bg-[var(--card)] p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">
        Add New Business
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-[var(--muted-foreground)] mb-2"
          >
            Business Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-md text-[var(--foreground)] bg-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Enter business name"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="slogan"
            className="block text-[var(--muted-foreground)] mb-2"
          >
            Slogan
          </label>
          <input
            id="slogan"
            type="text"
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
            className="w-full p-3 border rounded-md text-[var(--foreground)] bg-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Enter business slogan"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="status"
            className="block text-[var(--muted-foreground)] mb-2"
          >
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "pending" | "approved" | "denied")
            }
            className="w-full p-3 border rounded-md text-[var(--foreground)] bg-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded-md hover:bg-[var(--primary-foreground)] hover:text-[var(--primary)]"
        >
          Add Business
        </button>
      </form>
    </div>
  );
};

export default BusinessForm;
