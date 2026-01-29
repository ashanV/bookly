"use client";

import React from 'react';
import { toast } from '@/components/Toast';

export default function SettingsCardGrid({ cards, activeCategory, onCardClick }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {cards[activeCategory]?.map((card) => {
                const Icon = card.icon;
                return (
                    <button
                        key={card.id}
                        onClick={() => {
                            if (card.comingSoon) {
                                toast.info("Ta funkcja będzie dostępna wkrótce.");
                            } else if (card.route || card.component || card.id) {
                                onCardClick(card.component || card.id);
                            }
                        }}
                        className={`
                            text-left p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group
                            ${card.comingSoon ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01]'}
                        `}
                    >
                        <div className={`
                            w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
                            ${card.bgColor}
                        `}>
                            <Icon className={card.color} size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                            {card.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {card.description}
                        </p>
                        {card.comingSoon && (
                            <span className="inline-block mt-3 text-xs font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded-md">
                                Wkrótce
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
