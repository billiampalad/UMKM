// src/shared/components/Loading.js
import React from 'react';

const Loading = ({ message = 'Loading...', size = 'medium' }) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'loading-small';
      case 'large':
        return 'loading-large';
      default:
        return 'loading-medium';
    }
  };

  return (
    <div className={`loading-container ${getSizeClass()}`}>
      <div className="loading-content">
        <div className="spinner"></div>
        <p className="loading-message">{message}</p>
      </div>

      <style jsx>{`
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .loading-small {
          padding: 1rem;
          min-height: 100px;
        }

        .loading-medium {
          padding: 2rem;
          min-height: 200px;
        }

        .loading-large {
          padding: 4rem;
          min-height: 300px;
        }

        .loading-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-small .spinner {
          width: 24px;
          height: 24px;
          border-width: 2px;
        }

        .loading-medium .spinner {
          width: 40px;
          height: 40px;
          border-width: 3px;
        }

        .loading-large .spinner {
          width: 60px;
          height: 60px;
          border-width: 4px;
        }

        .loading-message {
          color: #666;
          margin: 0;
          font-weight: 500;
        }

        .loading-small .loading-message {
          font-size: 0.875rem;
        }

        .loading-medium .loading-message {
          font-size: 1rem;
        }

        .loading-large .loading-message {
          font-size: 1.125rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;