"use client";

import React, { useState } from 'react';
import { MapPin, Star, Heart, Calendar, ChevronDown, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; 

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
    <div 
      className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-violet-300 relative cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Reszta kodu pozostaje bez zmian */}
      {studio.isPromoted && (
        <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md backdrop-blur-md">
          -{studio.discount}% Promocja
        </div>
      )}

      <div className="relative overflow-hidden">
        <Image
          width={400}
          height={300}
          src={studio.image}
          alt={studio.name}
          className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(studio.id);
            }}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-100 hover:text-red-500'}`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2">
          {studio.categories.map((category) => (
            <span key={category} className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-semibold">
              {category}
            </span>
          ))}
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
            {studio.name}
          </h3>
          <p className="text-gray-600 mb-3">{studio.description}</p>
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-5 h-5 mr-2 text-violet-500" />
            <span className="text-base">{studio.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-base">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
              <span className="font-semibold">{studio.rating}</span>
              <span className="text-gray-500 ml-1">({studio.reviews})</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Heart className="w-5 h-5 mr-1" />
              <span>{studio.likes}</span>
            </div>
          </div>
        </div>

        {/* Sekcja usług */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-bold text-gray-900">Usługi ({studio.services.length})</h4>
            {studio.services.length > 3 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllServices(!showAllServices);
                }}
                className="text-violet-600 hover:text-violet-700 font-medium text-sm flex items-center transition-colors duration-200"
              >
                {showAllServices ? 'Pokaż mniej' : 'Zobacz wszystkie'}
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${showAllServices ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {displayedServices.map((service) => (
              <div key={service.id} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-6">
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h5>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">{service.duration} min</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-violet-600 mb-3">{service.price} zł</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingClick(studio, service);
                      }}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      Rezerwuj
                    </button>
                  </div>
                </div>
                
                {/* Tagi usług */}
                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                    {service.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="bg-violet-100 text-violet-700 px-3 py-1.5 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                    {service.tags.length > 4 && (
                      <span className="text-gray-400 text-xs self-center px-2">
                        +{service.tags.length - 4} więcej
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-base text-gray-500 py-4 border-t border-gray-100">
          <span className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            {studio.distance}
          </span>
          <span className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            {studio.nextAvailable}
          </span>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="space-y-1">
            <div className="text-sm text-gray-500">
              Usługi od {minPrice} zł {minPrice !== maxPrice && `- ${maxPrice} zł`}
            </div>
            {studio.isPromoted && (
              <div className="text-sm font-medium text-orange-600">
                🔥 Promocja -{studio.discount}%
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDetailsClick();
            }}
            className="bg-gradient-to-r from-violet-600 to-purple-600 cursor-pointer hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
          >
            <span>Szczegóły</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}