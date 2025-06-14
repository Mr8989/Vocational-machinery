import React from 'react'
import {motion} from "framer-motion";

const categories = ["Backhoe", "Forklift", "Excavator", "Long Truck", "Crane"];

function CategorySelector({selectCategory, onSelectCategory}) {
  return (
    <div className='flex flex-wrap justify-center gap-4 p-4 bg-gray-900 rounded-lg shadow-xl mx-auto max-w-4xl'>
      {categories.map((category) => (
        <motion.button key={category}
        onClick={() => onSelectCategory(category)}
        className={`px-6 py-2 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out
            ${selectCategory === category
                ? 'bg-emerald-600 text-white shadow-lg scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
            whileHover={{scale: 1.05}}
            whileTap={{scale:0.95}}
        > {category}</motion.button>
      ))}
    </div>
  )
}

export default CategorySelector
