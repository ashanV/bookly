"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, Heart, User, Settings, Bell, CreditCard, Gift, ChevronRight, Phone, Mail, Camera, Edit2, Trash2, MessageCircle } from 'lucide-react';

// Mock data
const mockUser = {
  id: 1,
  name: "Anna Kowalska",
  email: "anna.kowalska@example.com",
  phone: "+48 123 456 789",
  avatar: "https://images.unsplash.com/photo-1758344953670-c15779f89ed4?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  memberSince: "2023",
  totalBookings: 47,
  favoriteStudios: 8,
  points: 1250
};

const mockBookings = [
  {
    id: 1,
    studioName: "Elite Barber Shop",
    service: "Strzyżenie męskie Premium + Stylizacja",
    date: "2025-09-28",
    time: "14:30",
    duration: 60,
    price: 120,
    status: "confirmed",
    address: "ul. Mokotowska 15, Warszawa",
    specialist: "Michał Nowak",
    image: "https://images.unsplash.com/photo-1503951914875-befea7470dac?w=100&h=100&fit=crop",
    phone: "+48 123 456 789",
    canCancel: true,
    canReschedule: true
  },
  {
    id: 2,
    studioName: "Studio Piękna Aurora",
    service: "Manicure hybrydowy z wzorkami",
    date: "2025-09-30",
    time: "10:00",
    duration: 90,
    price: 150,
    status: "confirmed",
    address: "ul. Floriańska 12, Kraków",
    specialist: "Karolina Wiśniewska",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=100&h=100&fit=crop",
    phone: "+48 987 654 321",
    canCancel: true,
    canReschedule: true
  },
  {
    id: 3,
    studioName: "Wellness & Relax Center",
    service: "Masaż relaksacyjny całego ciała",
    date: "2025-09-25",
    time: "16:00",
    duration: 90,
    price: 200,
    status: "completed",
    address: "ul. Rynek 8, Wrocław",
    specialist: "Magdalena Zielińska",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=100&h=100&fit=crop",
    rating: 5,
    review: "Fantastyczny masaż! Polecam każdemu."
  }
];

const mockFavorites = [
  {
    id: 1,
    name: "Elite Barber Shop",
    category: "Fryzjer",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1503951914875-befea7470dac?w=100&h=100&fit=crop",
    location: "Warszawa, Mokotów",
    nextAvailable: "Dziś 15:00"
  },
  {
    id: 2,
    name: "Studio Piękna Aurora",
    category: "Paznokcie",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=100&h=100&fit=crop",
    location: "Kraków, Stare Miasto",
    nextAvailable: "Jutro 11:30"
  }
];

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user] = useState(mockUser);
  const [bookings] = useState(mockBookings);
  const [favorites] = useState(mockFavorites);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      confirmed: { text: 'Potwierdzone', className: 'bg-green-100 text-green-800' },
      pending: { text: 'Oczekujące', className: 'bg-yellow-100 text-yellow-800' },
      completed: { text: 'Zakończone', className: 'bg-gray-100 text-gray-800' },
      cancelled: { text: 'Anulowane', className: 'bg-red-100 text-red-800' }
    };
    const { text, className } = statusMap[status] || statusMap.pending;
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${className}`}>{text}</span>;
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-3 w-full px-6 py-4 text-left rounded-xl transition-all duration-300 ${isActive
          ? 'bg-violet-600 text-white shadow-lg transform scale-[1.02]'
          : 'text-gray-600 hover:bg-gray-50 hover:text-violet-600'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                Bookly
              </h1>
              <p className="text-xs text-gray-500 font-medium">Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-3 text-gray-400 hover:text-violet-600 transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                <span className="font-medium text-gray-700">{user.name.split(' ')[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <div className="text-center mb-8">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center shadow-lg">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-violet-600">{user.totalBookings}</div>
                    <div className="text-xs text-gray-500">Rezerwacji</div>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">{user.points}</div>
                    <div className="text-xs text-gray-500">Punktów</div>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                <TabButton
                  id="overview"
                  label="Przegląd"
                  icon={User}
                  isActive={activeTab === 'overview'}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="bookings"
                  label="Rezerwacje"
                  icon={Calendar}
                  isActive={activeTab === 'bookings'}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="favorites"
                  label="Ulubione"
                  icon={Heart}
                  isActive={activeTab === 'favorites'}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="profile"
                  label="Profil"
                  icon={Settings}
                  isActive={activeTab === 'profile'}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="rewards"
                  label="Nagrody"
                  icon={Gift}
                  isActive={activeTab === 'rewards'}
                  onClick={setActiveTab}
                />
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-violet-100 text-sm">Nadchodzące</p>
                        <p className="text-3xl font-bold">{upcomingBookings.length}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-violet-200" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-pink-100 text-sm">Ulubione</p>
                        <p className="text-3xl font-bold">{favorites.length}</p>
                      </div>
                      <Heart className="w-8 h-8 text-pink-200 fill-current" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Punkty</p>
                        <p className="text-3xl font-bold">{user.points}</p>
                      </div>
                      <Gift className="w-8 h-8 text-blue-200" />
                    </div>
                  </div>
                </div>

                {/* Upcoming Bookings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Nadchodzące rezerwacje</h2>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="text-violet-600 hover:text-violet-700 font-medium flex items-center space-x-1"
                    >
                      <span>Zobacz wszystkie</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {upcomingBookings.slice(0, 2).map(booking => (
                      <div key={booking.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <img src={booking.image} alt={booking.studioName} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{booking.studioName}</h3>
                          <p className="text-gray-600 text-sm">{booking.service}</p>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(booking.date)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{booking.time}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{booking.price} zł</p>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Favorites */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Ulubione miejsca</h2>
                    <button
                      onClick={() => setActiveTab('favorites')}
                      className="text-violet-600 hover:text-violet-700 font-medium flex items-center space-x-1"
                    >
                      <span>Zobacz wszystkie</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.map(favorite => (
                      <div key={favorite.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <img src={favorite.image} alt={favorite.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{favorite.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span>{favorite.rating}</span>
                            </span>
                            <span>•</span>
                            <span>{favorite.category}</span>
                          </div>
                        </div>
                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Wszystkie rezerwacje</h2>

                  <div className="space-y-6">
                    {bookings.map(booking => (
                      <div key={booking.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                          <div className="flex items-start space-x-4">
                            <img src={booking.image} alt={booking.studioName} className="w-20 h-20 rounded-xl object-cover" />
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900">{booking.studioName}</h3>
                              <p className="text-gray-600 mb-2">{booking.service}</p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(booking.date)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{booking.time} ({booking.duration} min)</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{booking.address}</span>
                                </span>
                                {booking.specialist && (
                                  <span className="flex items-center space-x-1">
                                    <User className="w-4 h-4" />
                                    <span>{booking.specialist}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-3">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">{booking.price} zł</p>
                              {getStatusBadge(booking.status)}
                            </div>

                            {booking.status === 'confirmed' && (
                              <div className="flex space-x-2">
                                {booking.phone && (
                                  <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                                    <Phone className="w-5 h-5" />
                                  </button>
                                )}
                                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                  <MessageCircle className="w-5 h-5" />
                                </button>
                                {booking.canReschedule && (
                                  <button className="p-2 text-gray-400 hover:text-violet-600 transition-colors">
                                    <Edit2 className="w-5 h-5" />
                                  </button>
                                )}
                                {booking.canCancel && (
                                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            )}

                            {booking.status === 'completed' && booking.rating && (
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < booking.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {booking.review && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700 italic">"{booking.review}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Ulubione miejsca</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favorites.map(favorite => (
                      <div key={favorite.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start space-x-4">
                          <img src={favorite.image} alt={favorite.name} className="w-16 h-16 rounded-xl object-cover" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{favorite.name}</h3>
                                <p className="text-gray-600 text-sm">{favorite.category}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                  <span className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span>{favorite.rating}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{favorite.location}</span>
                                  </span>
                                </div>
                                <p className="text-green-600 text-sm mt-1">Dostępny: {favorite.nextAvailable}</p>
                              </div>
                              <Heart className="w-6 h-6 text-red-500 fill-current" />
                            </div>
                            <button className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                              Zarezerwuj
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Profil użytkownika</h2>
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>{isEditingProfile ? 'Zapisz' : 'Edytuj'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Imię i nazwisko</label>
                      <input
                        type="text"
                        defaultValue={user.name}
                        disabled={!isEditingProfile}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        disabled={!isEditingProfile}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                      <input
                        type="tel"
                        defaultValue={user.phone}
                        disabled={!isEditingProfile}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Członek od</label>
                      <input
                        type="text"
                        value={user.memberSince}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Program lojalnościowy</h2>

                  <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-6 text-white mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">Twoje punkty</h3>
                        <p className="text-3xl font-black">{user.points}</p>
                        <p className="text-violet-200 text-sm mt-1">Do następnego poziomu: 250 punktów</p>
                      </div>
                      <Gift className="w-16 h-16 text-violet-200" />
                    </div>
                    <div className="w-full bg-violet-400 rounded-full h-2 mt-4">
                      <div className="bg-white rounded-full h-2" style={{ width: '83%' }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-xl p-6 text-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift className="w-8 h-8 text-yellow-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Zniżka 10%</h3>
                      <p className="text-gray-600 text-sm mb-4">Na następną rezerwację</p>
                      <p className="text-2xl font-bold text-yellow-600 mb-4">500 pkt</p>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                        Odbierz
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Darmowa usługa</h3>
                      <p className="text-gray-600 text-sm mb-4">Do wartości 100 zł</p>
                      <p className="text-2xl font-bold text-green-600 mb-4">1000 pkt</p>
                      <button className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-medium cursor-not-allowed">
                        Niedostępne
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6 text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Voucher 50 zł</h3>
                      <p className="text-gray-600 text-sm mb-4">Na dowolne usługi</p>
                      <p className="text-2xl font-bold text-purple-600 mb-4">750 pkt</p>
                      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                        Odbierz
                      </button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Jak zdobywać punkty?</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-gray-600">
                        <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                          <span className="text-violet-600 font-bold text-sm">+10</span>
                        </div>
                        <span>Za każde 10 zł wydane na usługi</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">+50</span>
                        </div>
                        <span>Za polecenie znajomego</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">+25</span>
                        </div>
                        <span>Za opinię o usłudze</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
