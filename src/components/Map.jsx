"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Star, Clock, Heart, ArrowRight, Filter, Search, ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load heavy map components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100"><p className="text-gray-500">Ładowanie mapy...</p></div>
});
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

// Create a wrapper for MapController that can use useMap hook
const MapControllerWrapper = dynamic(
  () => Promise.all([
    import('react-leaflet'),
    import('react')
  ]).then(([reactLeaflet, react]) => {
    const { useMap } = reactLeaflet;
    const { useEffect } = react;
    
    return ({ selectedStudio }) => {
      const map = useMap();
      useEffect(() => {
        if (map && selectedStudio?.lat && selectedStudio?.lng) {
          map.flyTo([selectedStudio.lat, selectedStudio.lng], 15, {
            animate: true,
            duration: 1.5,
          });
        }
      }, [selectedStudio, map]);
      return null;
    };
  }),
  { ssr: false }
);

// Lazy load leaflet CSS
if (typeof window !== 'undefined') {
  import('leaflet/dist/leaflet.css');
}

import L from 'leaflet';

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

// MapController is now defined as a dynamic wrapper above

// --- Studio Card Component ---
function StudioCard({ studio, onFavorite, isFavorite }) {
  const [showAllServices, setShowAllServices] = useState(false);
  const displayedServices = showAllServices ? studio.services : studio.services.slice(0, 2);
  const minPrice = Math.min(...studio.services.map(s => s.price));
  const maxPrice = Math.max(...studio.services.map(s => s.price));

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl hover:shadow-violet-200/50 overflow-hidden border border-gray-200/80 transition-all duration-400 group relative">
      <div className="relative overflow-hidden">
        <img
          src={studio.image}
          alt={studio.name}
          className="w-full h-48 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Odznaki na zdjęciu */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {studio.isPromoted && (
            <span className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
              -{studio.discount}% Promocja
            </span>
          )}
          {studio.rating >= 4.8 && (
            <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
              ⭐ TOP
            </span>
          )}
        </div>

        <button
          onClick={() => onFavorite(studio.id)}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 ${isFavorite ? 'bg-red-500/80 text-white' : 'bg-white/80 text-gray-700 hover:bg-red-100 hover:text-red-500'}`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Categories badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
          {studio.categories.map((category) => (
            <span key={category} className="bg-black/60 text-white px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
              {category}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 line-clamp-2 leading-tight">{studio.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{studio.description}</p>
          <div className="flex items-center text-gray-500 text-sm mt-1.5">
            <MapPin className="w-4 h-4 mr-2 text-violet-500 flex-shrink-0" />
            <span className="truncate">{studio.location}</span>
          </div>
        </div>

        {/* Sekcja statystyk */}
        <div className="flex items-center justify-around bg-gray-50/70 rounded-xl p-2.5 text-sm">
          <div className="flex flex-col items-center">
            <div className="flex items-center font-bold text-gray-800">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1.5" />
              {studio.rating}
            </div>
            <div className="text-xs text-gray-500">({studio.reviews} opinii)</div>
          </div>
          <div className="h-8 border-l border-gray-200"></div>
          <div className="flex flex-col items-center">
            <div className="font-bold text-gray-800">{studio.services.length}</div>
            <div className="text-xs text-gray-500">Usług</div>
          </div>
        </div>

        {/* Lista usług */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 text-sm">Usługi</h4>
            {studio.services.length > 2 && (
              <button
                onClick={() => setShowAllServices(!showAllServices)}
                className="text-violet-600 hover:text-violet-700 font-medium text-xs flex items-center"
              >
                {showAllServices ? 'Mniej' : `+${studio.services.length - 2}`}
                <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showAllServices ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {displayedServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{service.name}</div>
                  <div className="text-xs text-gray-500">{service.duration} min</div>
                </div>
                <div className="font-bold text-violet-600 ml-2">{service.price} zł</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cena i przycisk rezerwacji */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div>
            <div className="text-sm text-gray-500">
              Od {minPrice} zł {minPrice !== maxPrice && `- ${maxPrice} zł`}
            </div>
            {studio.isPromoted && (
              <div className="text-sm font-medium text-orange-600">
                🔥 Promocja -{studio.discount}%
              </div>
            )}
          </div>
          <button className="relative overflow-hidden group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center text-sm">
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white/20 rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
            <span className="relative">Rezerwuj</span>
            <ArrowRight className="w-3 h-3 ml-1 relative group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Map Modal Component ---
function MapModal({ isOpen, onClose, filteredStudios, topStudio, favorites, onFavorite }) {
  const [selectedStudio, setSelectedStudio] = useState(topStudio);
  const [mapStyle, setMapStyle] = useState('streets');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const listRef = useRef(null);

  const mapCenter = filteredStudios.length > 0
    ? [
      filteredStudios.reduce((sum, studio) => sum + studio.lat, 0) / filteredStudios.length,
      filteredStudios.reduce((sum, studio) => sum + studio.lng, 0) / filteredStudios.length
    ]
    : [52.2297, 21.0118];

  const processedStudios = filteredStudios
    .filter(studio =>
      studio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studio.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studio.services.some(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') {
        const aMinPrice = Math.min(...a.services.map(s => s.price));
        const bMinPrice = Math.min(...b.services.map(s => s.price));
        return aMinPrice - bMinPrice;
      }
      if (sortBy === 'services') return b.services.length - a.services.length;
      return 0;
    });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedStudio(topStudio || processedStudios[0]);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, topStudio, processedStudios]);

  useEffect(() => {
    if (selectedStudio && listRef.current) {
      const selectedElement = listRef.current.querySelector(`#studio-${selectedStudio.id}`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedStudio]);


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
              <h2 className="text-xl font-bold text-gray-800">Przeglądaj Studia</h2>
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
                <option value="services">Sortuj: Liczba usług</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Service List / Details */}
          <div className="flex-1 overflow-y-auto p-2">
            {selectedStudio ? (
              <div className="p-2">
                <StudioCard
                  studio={selectedStudio}
                  onFavorite={onFavorite}
                  isFavorite={favorites.has(selectedStudio.id)}
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-8">
                <MapPin className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="font-semibold text-lg">Brak wybranego studia</h3>
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
            <MapControllerWrapper selectedStudio={selectedStudio} />
            <TileLayer
              url={mapStyles[mapStyle]}
              attribution='&copy; OpenStreetMap contributors'
            />
            {processedStudios.map(studio => (
              <Marker
                key={studio.id}
                position={[studio.lat, studio.lng]}
                icon={selectedStudio?.id === studio.id ? selectedIcon : defaultIcon}
                eventHandlers={{ click: () => setSelectedStudio(studio) }}
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
                  title={style ? style.charAt(0).toUpperCase() + style.slice(1) : ''}
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