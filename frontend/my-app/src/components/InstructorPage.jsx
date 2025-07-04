import {  Video } from 'lucide-react'
import React, { useState } from 'react'
import {motion} from "framer-motion";
import CreateBackhoe from "./CreateBackhoe";

const tabs = [
  { id: "Create", label: "Create videos", icon: Video },

];

function InstructorPage() {
  const [activeTab, setActiveTab] = useState("create");
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-16"></div>
      <motion.h1
        className="text-4xl font-bold mb-8 text-emerald-400 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Instructor Dashboard
      </motion.h1>
      <div className="flex justify-center mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items px-4 py-2 mx-2 rounded-md transition-colors duration-200 ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <tab.icon className="mr-2 h-h-5 w-5" />
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "Create" && <CreateBackhoe/>}
    </div>
  );
}

export default InstructorPage
