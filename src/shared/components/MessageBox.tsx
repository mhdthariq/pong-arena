import React from "react";

interface MessageBoxProps {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

const MessageBox: React.FC<MessageBoxProps> = ({
  message,
  onConfirm,
  onCancel,
  showCancel = false,
}) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full transform transition-all duration-300 scale-100 opacity-100">
        <p className="text-gray-800 text-lg mb-6 text-center">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            OK
          </button>
          {showCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
