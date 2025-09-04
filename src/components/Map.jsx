"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Star, Clock, Heart, ArrowRight, Filter, Search, Navigation, Layers } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';

// Custom hook for map animations and interactions
function MapController({ center, zoom, selectedService }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedService && selectedService.lat && selectedService.lng) {
      map.flyTo([selectedService.lat, selectedService.lng], 15, {
        duration: 1.5,
        easeLinearity: 0.1
      });
    }
  }, [selectedService, map]);

  useMapEvents({
    zoomend: () => {
      // Optional: handle zoom events
    },
    moveend: () => {
      // Optional: handle move events
    }
  });

  return null;
}

function ServiceCard({ service, onFavorite, isFavorite, isCompact = false }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateY(20px)';
      cardRef.current.style.opacity = '0';
      
      const timer = setTimeout(() => {
        cardRef.current.style.transform = 'translateY(0)';
        cardRef.current.style.opacity = '1';
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [service]);

  return (
    <div 
      ref={cardRef}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:border-violet-300 transition-all duration-500 relative hover:shadow-2xl hover:-translate-y-2 ${isCompact ? 'scale-95' : ''}`}
      style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      {service.isPromoted && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
            <span className="relative z-10">-{service.discount}% Promocja</span>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden group">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => onFavorite(service.id)}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-500 shadow-lg hover:scale-110 ${
              isFavorite 
                ? 'bg-red-500 text-white shadow-red-200' 
                : 'bg-white/90 text-gray-600 hover:bg-red-100 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 transition-all duration-300 ${isFavorite ? 'fill-current animate-pulse' : ''}`} />
          </button>
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold border border-white/20">
            {service.category}
          </span>
        </div>

        {/* Service quality indicator */}
        <div className="absolute top-3 left-3 z-10">
          {service.rating >= 4.5 && (
            <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              ⭐ TOP
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 hover:text-violet-600 transition-colors duration-300">
            {service.name}
          </h3>
          <div className="flex items-center text-gray-600 text-sm mb-2 hover:text-violet-500 transition-colors duration-300">
            <MapPin className="w-4 h-4 mr-1 text-violet-500" />
            <span className="truncate">{service.salon}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <div className="flex items-center group">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold">{service.rating}</span>
              <span className="text-gray-500 ml-1">({service.reviews})</span>
            </div>
            <div className="flex items-center text-gray-500 group">
              <Clock className="w-4 h-4 mr-1 group-hover:text-violet-500 transition-colors duration-300" />
              <span>{service.duration} min</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {service.tags.slice(0, 2).map((tag, index) => (
            <span 
              key={tag} 
              className="bg-violet-100 text-violet-700 px-2 py-1 rounded-full text-xs font-medium hover:bg-violet-200 transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2">
          <div>
            {service.isPromoted && (
              <div className="text-sm text-gray-400 line-through opacity-75">
                {Math.round(service.price / (1 - service.discount / 100))} zł
              </div>
            )}
            <div className="text-xl font-bold text-gray-900 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {service.price} zł
            </div>
          </div>
          <button className="group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-full font-semibold shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-500 flex items-center space-x-1 text-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span className="relative z-10">Rezerwuj</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MapModal({ isOpen, onClose, filteredServices, topService, favorites, onFavorite }) {
  const [selectedService, setSelectedService] = useState(topService);
  const [mapStyle, setMapStyle] = useState('streets');
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const modalRef = useRef(null);

  // Enhanced map center calculation
  const mapCenter = filteredServices.length > 0 
    ? [
        filteredServices.reduce((sum, service) => sum + service.lat, 0) / filteredServices.length,
        filteredServices.reduce((sum, service) => sum + service.lng, 0) / filteredServices.length
      ]
    : [52.2297, 21.0118];

  // Filter and sort services
  const processedServices = filteredServices
    .filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.salon.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
      
      if (modalRef.current) {
        modalRef.current.style.transform = 'scale(0.9) rotateX(10deg)';
        modalRef.current.style.opacity = '0';
        
        setTimeout(() => {
          modalRef.current.style.transform = 'scale(1) rotateX(0deg)';
          modalRef.current.style.opacity = '1';
        }, 100);
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (!isOpen) return null;

  const mapStyles = {
    streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
  };

  return (
    <>
      {/* Enhanced Overlay with blur animation */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-black/60 via-purple/20 to-black/60 backdrop-blur-md z-50 transition-all duration-500" 
        onClick={onClose}
        style={{ backdropFilter: 'blur(8px) saturate(1.2)' }}
      />
      
      {/* Modal with 3D transform */}
      <div 
        ref={modalRef}
        className="fixed inset-4 bg-white rounded-3xl shadow-2xl z-50 flex flex-col md:flex-row overflow-hidden border border-white/20"
        style={{ 
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Enhanced Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-violet-50 to-purple-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Mapa usług</h3>
            <p className="text-sm text-gray-600">{processedServices.length} dostępnych</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 hover:rotate-90"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Enhanced Map Container */}
        <div className="flex-1 relative overflow-hidden">
          <MapContainer 
            center={mapCenter} 
            zoom={10} 
            style={{ height: '100%', width: '100%' }}
            className="z-10"
            zoomAnimation={true}
            fadeAnimation={true}
            markerZoomAnimation={true}
          >
            <MapController 
              center={mapCenter} 
              zoom={10} 
              selectedService={selectedService}
            />
            <TileLayer
              url={mapStyles[mapStyle]}
              attribution='&copy; OpenStreetMap contributors'
            />
            {processedServices.map(service => (
              <Marker 
                key={service.id} 
                position={[service.lat, service.lng]}
                eventHandlers={{
                  click: () => handleServiceSelect(service)
                }}
              >
                <Popup className="custom-popup">
                  <div className="text-center p-2">
                    <h4 className="font-semibold text-gray-900 mb-1">{service.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{service.salon}</p>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span>{service.rating}</span>
                      </div>
                      <span className="text-violet-600 font-bold">{service.price} zł</span>
                    </div>
                    <button 
                      onClick={() => handleServiceSelect(service)}
                      className="mt-2 text-violet-600 hover:text-violet-800 font-medium text-sm"
                    >
                      Zobacz szczegóły →
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Enhanced Controls */}
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-col md:flex-row gap-2">
            {/* Stats with animation */}
            <div className="bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-white/20">
              <div className="flex items-center space-x-4 text-sm font-medium">
                <span className="text-violet-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {processedServices.length} usług
                </span>
                {favorites.size > 0 && (
                  <span className="text-red-500 flex items-center">
                    <Heart className="w-4 h-4 mr-1 fill-current" />
                    {favorites.size}
                  </span>
                )}
              </div>
            </div>

            {/* Map Style Selector */}
            <div className="bg-white/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-white/20">
              <div className="flex space-x-1">
                {Object.keys(mapStyles).map(style => (
                  <button
                    key={style}
                    onClick={() => setMapStyle(style)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                      mapStyle === style 
                        ? 'bg-violet-600 text-white' 
                        : 'text-gray-600 hover:bg-violet-100'
                    }`}
                  >
                    {style === 'streets' ? '🗺️' : style === 'satellite' ? '🛰️' : '🌙'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Close Button */}
          <button
            onClick={onClose}
            className="hidden md:block absolute top-4 right-4 z-20 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 hover:rotate-90 border border-white/20"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Enhanced Sidebar */}
        <div className="w-full md:w-96 bg-gradient-to-br from-gray-50 to-violet-50/30 flex flex-col">
          {/* Search and Filter Header */}
          <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Szukaj usług..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
                />
              </div>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
              >
                <option value="rating">Sortuj po ocenie</option>
                <option value="price">Sortuj po cenie</option>
                <option value="duration">Sortuj po czasie</option>
              </select>
            </div>
          </div>

          {/* Service Details */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-br from-gray-50 to-violet-50/30 pb-4 z-10">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {selectedService ? 'Wybrana usługa' : 'Szczegóły'}
              </h3>
              {!selectedService && (
                <p className="text-sm text-gray-600">
                  Kliknij na marker na mapie, aby zobaczyć szczegóły usługi
                </p>
              )}
            </div>

            {selectedService ? (
              <ServiceCard
                service={selectedService}
                onFavorite={onFavorite}
                isFavorite={favorites.has(selectedService.id)}
              />
            ) : (
              <div className="text-center text-gray-500 py-12">
                <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4 animate-pulse" />
                <p className="text-sm">Wybierz usługę na mapie</p>
              </div>
            )}

            {/* Enhanced Stats */}
            {processedServices.length > 0 && (
              <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-white/50">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  📊 Statystyki
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                    <span className="text-gray-600">Najwyżej oceniana:</span>
                    <span className="font-bold text-yellow-600">
                      {Math.max(...processedServices.map(s => s.rating))}⭐
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                    <span className="text-gray-600">Najniższa cena:</span>
                    <span className="font-bold text-green-600">
                      {Math.min(...processedServices.map(s => s.price))} zł
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                    <span className="text-gray-600">Promocje:</span>
                    <span className="font-bold text-purple-600">
                      {processedServices.filter(s => s.isPromoted).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                    <span className="text-gray-600">Średni czas:</span>
                    <span className="font-bold text-blue-600">
                      {Math.round(processedServices.reduce((sum, s) => sum + s.duration, 0) / processedServices.length)} min
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default MapModal;