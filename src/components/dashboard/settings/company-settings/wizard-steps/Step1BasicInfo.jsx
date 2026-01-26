import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Step1BasicInfo({ formData, handleChange, errors }) {
    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Informacje podstawowe</h3>

            <div className="space-y-6">
                {/* Location Name */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-gray-900">Nazwa lokalizacji</label>
                        <span className="text-xs text-gray-400">{formData.name.length}/60</span>
                    </div>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        maxLength={60}
                        className={`w-full bg-white border rounded-lg py-2.5 px-4 text-sm outline-none transition-all ${errors.name ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-purple-600'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Numer kontaktowy lokalizacji</label>
                    <div className="flex gap-3">
                        <div className="relative w-24 flex-shrink-0">
                            <select
                                value={formData.phonePrefix}
                                onChange={(e) => handleChange('phonePrefix', e.target.value)}
                                className="w-full appearance-none bg-gray-100 border border-transparent rounded-lg py-2.5 pl-4 pr-8 text-sm font-medium text-gray-900 outline-none focus:border-purple-600 cursor-pointer"
                            >
                                <option value="+48">+48</option>
                                <option value="+1">+1</option>
                                <option value="+44">+44</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                        <div className="flex-1 w-full">
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className={`w-full bg-white border rounded-lg py-2.5 px-4 text-sm outline-none transition-all ${errors.phone ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-purple-600'}`}
                            />
                        </div>
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Adres e-mail lokalizacji</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full bg-white border rounded-lg py-2.5 px-4 text-sm outline-none transition-all ${errors.email ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-purple-600'}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
            </div>
        </div>
    );
}
