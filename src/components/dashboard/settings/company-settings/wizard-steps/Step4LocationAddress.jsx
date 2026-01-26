import React from 'react';

export default function Step4LocationAddress({
    formData,
    handleChange,
    errors,
    parsedAddress,
    billingAddressDisplay,
    openAddressModal
}) {
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Address Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Adres firmy</h3>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Gdzie znajduje się Twoja firma?</label>
                    <div className="relative">
                        {/* Mockup Map Pin Icon */}
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        </div>
                        <input
                            type="text"
                            disabled={formData.noAddress}
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            className={`w-full bg-white border rounded-lg py-3 pl-12 pr-4 text-sm outline-none transition-all ${errors.address ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-purple-600 disabled:bg-gray-50 disabled:text-gray-400'}`}
                            placeholder={formData.noAddress ? "" : "Wpisz adres"}
                        />
                    </div>
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}

                    {/* Address Details Table - Show if address is entered */}
                    {formData.address.length > 5 && !formData.noAddress && (
                        <div className="mt-6 border border-gray-100 rounded-xl p-6 bg-white animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Col 1 */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 mb-1">Adres</label>
                                        <p className="text-sm text-gray-700">{parsedAddress.street}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 mb-1">Miasto</label>
                                        <p className="text-sm text-gray-700">{parsedAddress.city}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 mb-1">Kraj</label>
                                        <p className="text-sm text-gray-700">{parsedAddress.country}</p>
                                    </div>
                                </div>

                                {/* Col 2 */}
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-xs font-bold text-gray-900">Nr lokalu, piętro</label>
                                        </div>
                                        <button
                                            onClick={() => openAddressModal('main')}
                                            className="text-sm text-purple-600 font-medium hover:underline"
                                        >
                                            {formData.addressDetails?.apartmentNumber ? "Zmień" : "+ Dodaj"}
                                        </button>
                                        {formData.addressDetails?.apartmentNumber && (
                                            <p className="text-sm text-gray-700">{formData.addressDetails.apartmentNumber}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 mb-1">Region</label>
                                        <p className="text-sm text-gray-700">{parsedAddress.region}</p>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-xs font-bold text-gray-900">Dojazd</label>
                                        </div>
                                        <button
                                            className="text-sm text-purple-600 font-medium hover:underline"
                                        >+ Dodaj</button>
                                    </div>
                                </div>

                                {/* Col 3 */}
                                <div className="relative space-y-4">
                                    <button
                                        onClick={() => openAddressModal('main')}
                                        className="absolute -top-1 right-0 text-sm text-purple-600 font-medium hover:underline"
                                    >
                                        Zmień
                                    </button>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-xs font-bold text-gray-900">Dzielnica</label>
                                        </div>
                                        <button
                                            onClick={() => openAddressModal('main')}
                                            className="text-sm text-purple-600 font-medium hover:underline"
                                        >
                                            {formData.addressDetails?.district ? "Zmień" : "+ Dodaj"}
                                        </button>
                                        {formData.addressDetails?.district && (
                                            <p className="text-sm text-gray-700">{formData.addressDetails.district}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 mb-1">Kod pocztowy</label>
                                        <p className="text-sm text-gray-700">{parsedAddress.zip}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex items-start gap-3">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                id="noAddress"
                                checked={formData.noAddress}
                                onChange={(e) => handleChange('noAddress', e.target.checked)}
                                className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                            />
                        </div>
                        <label htmlFor="noAddress" className="text-sm text-gray-700 cursor-pointer leading-tight pt-0.5">
                            Nie mam adresu firmowego (świadczę wyłącznie usługi mobilne z dojazdem do klienta i online)
                        </label>
                    </div>
                </div>
            </div>

            {/* Map Section - Show if address is entered */}
            {formData.address.length > 5 && !formData.noAddress && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Lokalizacja na mapie</h3>
                        <p className="text-sm text-gray-500">Przeciągnij mapę, aby pinezka odpowiadała dokładnej lokalizacji Twojej firmy.</p>
                    </div>
                    <div className="h-64 w-full bg-gray-100 relative">
                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(formData.address || 'Lublin')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

            {/* Billing Data Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Dane rozliczeniowe wymagane przy sprzedaży</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Te dane będą pojawiać się na dowodach sprzedaży z tej lokalizacji, wraz z informacjami skonfigurowanymi w ustawieniach <a href="#" className="text-purple-600 hover:underline">szablonu dowodu sprzedaży</a>.
                </p>

                <div className="space-y-4">
                    {/* Company Name Row */}
                    <div className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-gray-900">Nazwa firmy</span>
                            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">Zmień</button>
                        </div>
                        <p className="text-sm text-gray-700">ashan2</p>
                    </div>

                    {/* Address Row */}
                    <div className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-gray-900">Adres</span>
                        </div>
                        {billingAddressDisplay ? (
                            <div className="flex justify-between items-center group">
                                <p className="text-sm text-gray-700">{billingAddressDisplay}</p>
                                <button
                                    onClick={() => openAddressModal('billing')}
                                    className="text-sm text-purple-600 font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Zmień
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => openAddressModal('billing')}
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                            >
                                + Dodaj
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
