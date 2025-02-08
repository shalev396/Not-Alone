import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { api } from "@/api/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const BusinessForm: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const uploadImage = () => {
    const data = new FormData();
    if (image) {
      data.append("file", image);
      data.append("upload_preset", "YOUR_UPLOAD_PRESET"); // Replace with your preset name
      data.append("cloud_name", "YOUR_CLOUD_NAME"); // Replace with your Cloudinary cloud name

      fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload", {
        method: "POST",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setImageUrl(data.url); // Get the uploaded image URL
        })
        .catch((err) => console.error("Error uploading image:", err));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  interface BusinessFormValues {
    name: string;
    slogan: string;
    owner: string;
    media: string[];
  }

  const handleSubmit = async (values: BusinessFormValues) => {
    try {
      await api.post("/businesses", {
        ...values,
        media: [imageUrl],
      });

      toast({
        title: "Success",
        description: "Business created successfully!",
      });

      navigate("/business-dashboard");
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
        }}
        onSubmit={handleSubmit}
      >
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
            <input type="file" onChange={handleFileChange} className="mt-2" />
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
      </Formik>
    </div>
  );
};

export default BusinessForm;
