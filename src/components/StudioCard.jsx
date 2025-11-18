"use client";

import React, { useState } from 'react';
import { MapPin, Star, Heart, Calendar, ChevronDown, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudioCard({ studio, onFavorite, isFavorite, onBookingClick }) {
  const [showAllServices, setShowAllServices] = useState(false);
  const router = useRouter();
  const displayedServices = showAllServices ? studio.services : studio.services.slice(0, 3);
  const minPrice = Math.min(...studio.services.map(s => s.price));
  const maxPrice = Math.max(...studio.services.map(s => s.price));

  const handleDetailsClick = () => {
    router.push(`/client/salons/${studio.id}`);
  };

  const handleCardClick = (e) => {
    // Prevent navigation when clicking on buttons or interactive elements
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    handleDetailsClick();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-violet-100 relative cursor-pointer flex flex-col h-full"
      onClick={handleCardClick}
    >
      {studio.isPromoted && (
        <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md text-orange-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 border border-orange-100">
          <span>🔥</span>
          <span>-{studio.discount}%</span>
        </div>
      )}

      <div className="relative overflow-hidden aspect-[16/10]">
        <Image
          width={400}
          height={300}
          src={studio.image}
          alt={studio.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-3 right-3 z-20">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(studio.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'}`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5">
          {studio.categories.map((category) => (
            <span key={category} className="bg-white/95 backdrop-blur-sm text-gray-800 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {category}
            </span>
          ))}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-3">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-violet-600 transition-colors leading-tight line-clamp-1">
              {studio.name}
            </h3>
            <div className="flex items-center bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100 flex-shrink-0 ml-2">
              <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
              <span className="font-bold text-gray-900 text-xs">{studio.rating}</span>
              <span className="text-gray-400 text-[10px] ml-0.5">({studio.reviews})</span>
            </div>
          </div>

          <div className="flex items-center text-gray-500 text-xs mb-2">
            <MapPin className="w-3 h-3 mr-1 text-violet-500 flex-shrink-0" />
            <span className="truncate">{studio.location}</span>
            <span className="mx-1.5 text-gray-300">•</span>
            <span>{studio.distance}</span>
          </div>
        </div>

        {/* Sekcja usług */}
        <div className="border-t border-gray-50 pt-3 flex-grow">
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {displayedServices.map((service) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group/service flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-default -mx-2"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <h5 className="text-sm font-medium text-gray-700 truncate group-hover/service:text-violet-700 transition-colors">{service.name}</h5>
                    <div className="flex items-center text-gray-400 text-[10px] mt-0.5">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{service.duration} min</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">{service.price} zł</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingClick(studio, service);
                      }}
                      className="bg-violet-50 hover:bg-violet-600 text-violet-600 hover:text-white px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200"
                    >
                      Rezerwuj
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {studio.services.length > 3 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAllServices(!showAllServices);
              }}
              className="w-full text-center text-violet-600 hover:text-violet-700 font-medium text-xs mt-2 py-1 hover:bg-violet-50 rounded transition-colors duration-200"
            >
              {showAllServices ? 'Pokaż mniej' : `Zobacz więcej (+${studio.services.length - 3})`}
            </button>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Najbliższy termin</span>
            <span className="text-xs font-semibold text-green-600 flex items-center mt-0.5">
              <Calendar className="w-3 h-3 mr-1" />
              {studio.nextAvailable}
            </span>
          </div>
          <motion.button
            whileHover={{ x: 3 }}
            onClick={(e) => {
              e.stopPropagation();
              handleDetailsClick();
            }}
            className="text-gray-900 font-bold text-xs flex items-center hover:text-violet-600 transition-colors bg-gray-50 hover:bg-violet-50 px-3 py-2 rounded-lg"
          >
            Szczegóły <ArrowRight className="w-3 h-3 ml-1" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}