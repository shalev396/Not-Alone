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
