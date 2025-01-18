import React from "react";

interface ProfileImageDialogProps {
  profileImages: string[];
  onSelectImage: (image: string) => void;
  onClose: () => void;
}

const ProfileImageDialog: React.FC<ProfileImageDialogProps> = ({
  profileImages,
  onSelectImage,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 text-gray-100 p-6 rounded-lg shadow-md w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Select a Profile Picture</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-6">
          {profileImages.map((img, index) => (
            <div
              key={index}
              onClick={() => {
                onSelectImage(`/src/assets/profilePictures/${img}`);
                onClose();
              }}
              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden cursor-pointer border-2 border-gray-700 hover:border-green-500"
            >
              <img
                src={`/src/assets/profilePictures/${img}`}
                alt={img}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-500 text-white py-2 rounded hover:bg-red-400"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProfileImageDialog;
