import { useNavigate } from "react-router-dom";
import { api } from "@/api/api";
import { Formik, Form, ErrorMessage } from "formik";
import { z } from "zod"; // Import Zod
import { object, string } from "zod"; // You can import specific schema methods from Zod
import { Input } from "../ui/input";

// Zod validation schema for the form
const validationSchema = object({
  name: string().min(1, "Discount name is required"),
  discount: string().min(1, "Discount value is required"),
  expireDate: string().min(1, "Expiration date is required"),
});

interface DiscountFormProps {
  onSubmit: (discount: {
    name: string;
    discount: string;
    expireDate: string;
  }) => void;
}

const DiscountForm: React.FC<DiscountFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();

  const handleSubmit = async (values: {
    name: string;
    discount: string;
    expireDate: string;
  }) => {
    try {
      const response = await api.post(
        "/discounts/business/:businessId",
        values
      );
      console.log(response.data);
      onSubmit(response.data); // Pass the data to the parent component
      navigate("/"); // Redirect to the dashboard or home page
    } catch (error) {
      console.error("Error creating discount:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Create Discount</h1>

      <Formik
        initialValues={{
          name: "",
          discount: "",
          expireDate: "",
        }}
        validate={(values) => {
          console.log(values);

          try {
            // Validate the form data using the Zod schema
            validationSchema.parse(values);
            return {}; // Return empty object if validation is successful
          } catch (error) {
            console.log(error);
            if (error instanceof z.ZodError) {
              return error.errors.reduce((acc, curr) => {
                acc[curr.path[0]] = curr.message;
                return acc;
              }, {} as Record<string, string>);
            }
            return {}; // Return empty object in case of unexpected error
          }
        }}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Discount Name
              </label>
              <Input
                value={values.name}
                onChange={(e) => {
                  setFieldValue("name", e.target.value);
                }}
                type="text"
                id="name"
                name="name"
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="discount"
                className="block text-sm font-medium text-gray-700"
              >
                Discount Value
              </label>
              <Input
                value={values.discount}
                onChange={(e) => {
                  setFieldValue("discount", e.target.value);
                }}
                type="text"
                id="discount"
                name="discount"
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
              />
              <ErrorMessage
                name="discount"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="expireDate"
                className="block text-sm font-medium text-gray-700"
              >
                Expiration Date
              </label>
              <Input
                value={values.expireDate}
                onChange={(e) => {
                  setFieldValue("expireDate", e.target.value);
                }}
                type="date"
                id="expireDate"
                name="expireDate"
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
              />
              <ErrorMessage
                name="expireDate"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white py-2 rounded mt-4"
            >
              {isSubmitting ? "Creating..." : "Create Discount"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DiscountForm;
