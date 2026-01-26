import React from 'react';
import { Check } from 'lucide-react';

export default function Step3AdditionalTypes({ formData, handleChange, industries }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
            {industries
                .filter(item => item.id !== formData.businessType)
                .map((item) => {
                    const Icon = item.icon;
                    const isSelected = formData.additionalTypes.includes(item.id);
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleChange('additionalTypes', item.id)}
                            className={`
                            relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all text-center h-32
                            ${isSelected
                                    ? 'bg-white border-purple-600 shadow-md ring-1 ring-purple-600'
                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                }
                        `}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                    <Check size={12} className="text-white" />
                                </div>
                            )}
                            <Icon
                                size={32}
                                strokeWidth={1.5}
                                className={`mb-3 ${isSelected ? 'text-purple-600' : 'text-gray-900'}`}
                            />
                            <span className={`text-sm font-medium ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
        </div>
    );
}
