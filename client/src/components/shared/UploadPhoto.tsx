import React, { useState } from "react";
import axios from "axios";



export const uploadImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("upload_preset", "Mock-Social-Network-Preset");
  formData.append("cloud_name", "dnnifnoyf");

  try {
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dnnifnoyf/image/upload",
      formData
    );
    return response.data.secure_url; 
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

const ImageUpload = () => {
  //states for image creation
  const [image, setImage] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  //manage the imge state
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  //manage upload status
  const handleUpload = async () => {
    if (!image) {
      setUploadStatus("Please select an image to upload.");
      return;
    }
    //formData hold all of the config details as the body of the request
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "Mock-Social-Network-Preset");
    formData.append("cloud_name", "dnnifnoyf");

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dnnifnoyf/image/upload',
        formData
      );

      setUploadedImageUrl(response.data.secure_url); //send this to backend
      setUploadStatus("Image uploaded successfully!");
    } catch (error) {
      console.error(error);
      setUploadStatus("Error uploading image.");
    }
  };

  return (
    <div>
      <h1>Upload an Image</h1>
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleUpload}>Upload</button>
      {uploadStatus && <p>{uploadStatus}</p>}
      {uploadedImageUrl && (
        <div>
          <h2>Uploaded Image:</h2>
          <img
            src={uploadedImageUrl}
            alt="Uploaded"
            style={{ maxWidth: "300px" }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;