import type React from 'react';
import { Link } from 'react-router';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="mt-4 text-lg text-gray-600">Oops! The page you are looking for does not exist.</p>
      
      <Link 
        to="/" 
        className="mt-6 px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary/90 transition"
      >
        Go back home
      </Link>
    </div>
  );
}

export default NotFound;