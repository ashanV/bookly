"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Star, Clock, Heart, ArrowRight, Filter, Search, ChevronDown } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Custom SVG Icon for Markers ---
const createMarkerIcon = (isSelected = false) => {
  const iconSize = isSelected ? [38, 38] : [30, 30];
  const iconAnchor = isSelected ? [19, 38] : [15, 30];
  
  return new L.Icon({
    iconUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${iconSize[0]}" height="${iconSize[1]}" fill="%237c3aed"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" opacity="${isSelected ? '1' : '0.8'}"/></svg>`,
    iconSize: iconSize,
    iconAnchor: iconAnchor,
    popupAnchor: [0, -32],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: isSelected ? [19, 41] : [15, 41]
  });
};

const defaultIcon = createMarkerIcon(false);
const selectedIcon = createMarkerIcon(true);

// --- Map Controller Hook ---
function MapController({ selectedService }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedService?.lat && selectedService?.lng) {
      map.flyTo([selectedService.lat, selectedService.lng], 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [selectedService, map]);

  return null;
}

// --- (NOWA WERSJA) Service Card Component ---
function ServiceCard({ service, onFavorite, isFavorite }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl hover:shadow-violet-200/50 overflow-hidden border border-gray-200/80 transition-all duration-400 group relative">
      <div className="relative overflow-hidden">
        <img 
          src={service.image} 
          alt={service.name} 
          className="w-full h-48 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Odznaki na zdjęciu */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
            {service.isPromoted && (
                <span className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                -{service.discount}% Promocja
                </span>
            )}
            {service.rating >= 4.8 && (
                <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                ⭐ TOP
                </span>
            )}
        </div>

        <button
          onClick={() => onFavorite(service.id)}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 ${isFavorite ? 'bg-red-500/80 text-white' : 'bg-white/80 text-gray-700 hover:bg-red-100 hover:text-red-500'}`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute bottom-3 left-3">
          <span className="bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">{service.category}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col space-y-4">
        <div>
            <h3 className="text-xl font-bold text-gray-800 line-clamp-2 leading-tight">{service.name}</h3>
            <div className="flex items-center text-gray-500 text-sm mt-1.5">
                <MapPin className="w-4 h-4 mr-2 text-violet-500 flex-shrink-0" />
                <span className="truncate">{service.salon}</span>
            </div>
        </div>

        {/* Sekcja statystyk */}
        <div className="flex items-center justify-around bg-gray-50/70 rounded-xl p-2.5 text-sm">
            <div className="flex flex-col items-center">
                <div className="flex items-center font-bold text-gray-800">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1.5" />
                    {service.rating}
                </div>
                <div className="text-xs text-gray-500">({service.reviews} opinii)</div>
            </div>
            <div className="h-8 border-l border-gray-200"></div>
            <div className="flex flex-col items-center">
                <div className="font-bold text-gray-800">{service.duration} min</div>
                <div className="text-xs text-gray-500">Czas trwania</div>
            </div>
        </div>

        {/* Tagi */}
        <div className="flex flex-wrap gap-1.5">
            {service.tags.slice(0, 3).map(tag => (
                <span key={tag} className="bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full text-xs font-medium">
                {tag}
                </span>
            ))}
        </div>
        
        {/* Cena i przycisk rezerwacji */}
        <div className="flex justify-between items-center pt-2">
          <div>
            {service.isPromoted && (
              <p className="text-sm text-gray-400 line-through">
                {Math.round(service.price / (1 - service.discount / 100))} zł
              </p>
            )}
            <p className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{service.price} zł</p>
          </div>
          <button className="relative overflow-hidden group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center">
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white/20 rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
            <span className="relative">Rezerwuj</span>
            <ArrowRight className="w-4 h-4 ml-2 relative group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Map Modal Component ---
function MapModal({ isOpen, onClose, filteredServices, topService, favorites, onFavorite }) {
  const [selectedService, setSelectedService] = useState(topService);
  const [mapStyle, setMapStyle] = useState('streets');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const listRef = useRef(null);

  const mapCenter = filteredServices.length > 0 
    ? [
        filteredServices.reduce((sum, service) => sum + service.lat, 0) / filteredServices.length,
        filteredServices.reduce((sum, service) => sum + service.lng, 0) / filteredServices.length
      ]
    : [52.2297, 21.0118]; // Default center (Warsaw)

  const processedServices = filteredServices
    .filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.salon.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'duration') return a.duration - b.duration;
      return 0;
    });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedService(topService || processedServices[0]);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (selectedService && listRef.current) {
      const selectedElement = listRef.current.querySelector(`#service-${selectedService.id}`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedService]);


  if (!isOpen) return null;

  const mapStyles = {
    streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300" 
        onClick={onClose}
      />
      
      <div className="fixed inset-0 md:inset-5 bg-gray-100 rounded-none md:rounded-3xl shadow-2xl z-50 flex flex-col md:flex-row overflow-hidden">
        
        {/* --- Sidebar --- */}
        <div className="w-full md:w-[420px] bg-white flex flex-col border-r border-gray-200">
          {/* Header & Controls */}
          <div className="p-4 border-b border-gray-200 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Przeglądaj Usługi</h2>
                <button
                    onClick={onClose}
                    className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Szukaj po nazwie lub salonie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl appearance-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
              >
                <option value="rating">Sortuj: Najwyższa ocena</option>
                <option value="price">Sortuj: Cena (od najniższej)</option>
                <option value="duration">Sortuj: Czas trwania</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Service List / Details */}
          <div className="flex-1 overflow-y-auto p-2">
            {selectedService ? (
               <div className="p-2">
                  <ServiceCard 
                    service={selectedService}
                    onFavorite={onFavorite}
                    isFavorite={favorites.has(selectedService.id)}
                  />
               </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-8">
                <MapPin className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="font-semibold text-lg">Brak wybranej usługi</h3>
                <p>Kliknij na znacznik na mapie, aby zobaczyć szczegóły.</p>
              </div>
            )}
          </div>
        </div>

        {/* --- Map Container --- */}
        <div className="flex-1 relative">
          <MapContainer 
            center={mapCenter} 
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
            className="z-10"
          >
            <MapController selectedService={selectedService} />
            <TileLayer
              url={mapStyles[mapStyle]}
              attribution='&copy; OpenStreetMap contributors'
            />
            {processedServices.map(service => (
              <Marker 
                key={service.id} 
                position={[service.lat, service.lng]}
                icon={selectedService?.id === service.id ? selectedIcon : defaultIcon}
                eventHandlers={{ click: () => setSelectedService(service) }}
              />
            ))}
          </MapContainer>

          {/* Map Controls Overlay */}
          <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-4">
             <button
                onClick={onClose}
                className="hidden md:flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 hover:rotate-90"
            >
                <X className="w-6 h-6 text-gray-700" />
            </button>
            <div className="bg-white rounded-full p-1.5 shadow-lg flex items-center gap-1">
              {Object.keys(mapStyles).map(style => (
                <button
                  key={style}
                  onClick={() => setMapStyle(style)}
                  className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-colors duration-300 ${mapStyle === style ? 'bg-violet-600 text-white' : 'hover:bg-gray-100'}`}
                  title={style.charAt(0).toUpperCase() + style.slice(1)}
                >
                  {style === 'streets' ? '🗺️' : style === 'satellite' ? '🛰️' : '🌙'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MapModal;