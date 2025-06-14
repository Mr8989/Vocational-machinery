import React from 'react'
import voc from "../assets/voc.jpeg";

export default function Home() {
  return (
    <div className="flex flex-col justify-center">
      <div className='relative bg-[url("./assets/voc.jpeg")] h-screen bg-no-repeat opacity-25 bg-cover'></div>
      <div>
        <span className="absolute bottom-130 left-100 text-9xl font-bold text-white items-center space-x-2 flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          Chafas Institute Of Practical Studies
        </span>
        <span className="absolute bottom-120 left-150 text-4xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          The best NVTI accredited in Ghana
        </span>
      </div>
    </div>
  );
}
