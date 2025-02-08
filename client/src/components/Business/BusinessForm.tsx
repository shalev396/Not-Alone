import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { api } from "@/api/api";
import { uploadImage } from "@/components/shared/UploadPhoto";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface BusinessFormValues {
  name: string;
  slogan: string;
  owner: string;
  media: string[];
  file: File | null;
}

const BusinessForm = ({ onFinish }: { onFinish?: () => void }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (values: BusinessFormValues) => {
    try {
      if (!values.file) return;
      const imageUrl: string = await uploadImage(values.file);
      await api.post("/businesses", {
        ...values,
        media: imageUrl ? [imageUrl] : [],
      });

      toast({
        title: "Success",
        description: "Business created successfully!",
      });

      navigate("/business-dashboard");

      onFinish?.();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-4">Business Form</h1>

      <Formik
        initialValues={{
          name: "",
          slogan: "",
          owner: "",
          media: [],
          file: null,
        }}
        onSubmit={handleSubmit}
      >
        {(formik) => {
          return (
            <Form>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium">
                  Business Name
                </label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  className="mt-1 block w-full p-2 border rounded text-black"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="slogan" className="block text-sm font-medium">
                  Business Slogan
                </label>
                <Field
                  type="text"
                  id="slogan"
                  name="slogan"
                  className="mt-1 block w-full p-2 border rounded text-black"
                />
                <ErrorMessage
                  name="slogan"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="media" className="block text-sm font-medium">
                  Uploaded Image
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    e.preventDefault();
                    formik.setFieldValue("file", e.target.files?.[0]);
                  }}
                  className="mt-2"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="owner" className="block text-sm font-medium">
                  Owner
                </label>
                <Field
                  type="text"
                  id="owner"
                  name="owner"
                  className="mt-1 block w-full p-2 border rounded text-black"
                />
                <ErrorMessage
                  name="owner"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded mt-4"
              >
                Create Business
              </button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default BusinessForm;
