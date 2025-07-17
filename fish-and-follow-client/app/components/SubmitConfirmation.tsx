import React from 'react';

interface SubmitConfirmationProps {
  message?: string;
  subMessage?: string;
  onClose?: () => void;
}

const SubmitConfirmation: React.FC<SubmitConfirmationProps> = ({
  message = 'Your submission was successful!',
  subMessage = 'We\'ll get back to you as soon as possible.',
  onClose,
}) => {
  return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {message}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {subMessage}
          </p>
          <button
            onClick={onClose}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
};

export default SubmitConfirmation;