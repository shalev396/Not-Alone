import React from "react";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onCheckedChange }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="appearance-none h-5 w-5 border-2 border-gray-500 rounded-md checked:bg-green-500 focus:outline-none focus:ring-2"
      />
      <span className="ml-2 text-gray-200">Receive notifications about posts</span>
    </label>
  );
};

export default Checkbox;
