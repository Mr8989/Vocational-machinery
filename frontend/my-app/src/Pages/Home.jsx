import React from 'react'
import { motion } from 'framer-motion';
import dc from "../assets/dc.jpg"
import { CheckCircle } from 'lucide-react';

export default function Home() {

const backgroundImage =
  "https://www.google.com/url?sa=i&url=https%3A%2F%2Fheavyequipmenttraining.com%2Fget-accredited-earthmoving-training%2F&psig=AOvVaw2FIPPQfitXY8skvjMMfJJ1&ust=1750612964118000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCJDE6a6Mg44DFQAAAAAdAAAAABAL";

// List of courses (kept here for display on the home page as well)
// Note: Prices are handled in PaymentGate. This list is for display only.
const courses = [
  "Backhoe Operation",
  "Excavator Operation",
  "Forklift Certification",
  "Crane Operation & Safety",
  "Heavy Equipment Maintenance",
];

return (
  <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-emerald-700">


    <div className="relative z-10 text-center text-white px-4 py-16 max-w-7xl mx-auto w-full">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="
            text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl
            font-extrabold mb-4 drop-shadow-lg leading-tight
          "
      >
        Chafas Institute Of Practical Studies
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        className="
            text-2xl sm:text-3xl md:text-4xl lg:text-5xl
            font-semibold drop-shadow-md mb-12
          "
      >
        The best NVTI accredited in Ghana
      </motion.p>

      {/* New Courses Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg p-8 shadow-2xl mt-12 mx-auto max-w-3xl"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-6">
          Our Certified Courses
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {courses.map((course, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-gray-700 bg-opacity-80 p-4 rounded-md flex items-center space-x-3 transition-transform hover:scale-105 hover:bg-emerald-700"
            >
              <CheckCircle className="h-6 w-6 text-emerald-300 flex-shrink-0" />
              <span className="text-lg font-medium text-white">{course}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  </div>
);
}
