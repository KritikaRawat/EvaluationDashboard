import React from 'react';
function footer() {
  return (
    <div className= "h-10 bg-gray-900 py-4 text-center text-white">
      <div className="flex justify-center items-center mb-4">
        <div className="mr-4">
          <FaPhone className="inline-block mr-2" />
          <span>123-456-7890</span> {/* Replace with your phone number */}
        </div>
        <div>
          <FaEnvelope className="inline-block mr-2" />
          <span>example@example.com</span> {/* Replace with your email */}
        </div>
      </div>
      <div>
        <p className="text-sm">© {new Date().getFullYear()} Made by Kritika only</p>
      </div>
    </div>
  );
}

export default footer;
