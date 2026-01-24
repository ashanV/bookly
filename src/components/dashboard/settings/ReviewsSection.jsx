"use client";

import React from 'react';
import { Star, RefreshCw } from 'lucide-react';

export default function ReviewsSection({
    reviews,
    avgRating,
    onRefresh
}) {
    const reviewsArray = Array.isArray(reviews) ? reviews : [];

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Opinie Klientów</h2>
                    <p className="text-sm text-gray-500 mt-1">Przegląd opinii i ocen</p>
                </div>
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg transition-colors text-sm font-medium"
                    title="Odśwież opinie"
                >
                    <RefreshCw className="w-4 h-4" />
                    Odśwież
                </button>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 mb-8 border border-purple-200">
                <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                        <div className="text-5xl font-bold text-gray-900 mb-2">{avgRating.toFixed(1)}</div>
                        <div className="flex items-center gap-1 justify-center mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={i < Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                                    size={24}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-gray-600">{reviewsArray.length} opinii</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {reviewsArray.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Brak opinii.
                    </div>
                ) : (
                    reviewsArray.map((review, index) => (
                        <div key={review.id || index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                                    {review.author ? review.author.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-gray-900">{review.author || 'Anonimowy użytkownik'}</h3>
                                        <span className="text-sm text-gray-500">
                                            {review.date ? new Date(review.date).toLocaleDateString('pl-PL', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            }) : 'Brak daty'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                                                size={16}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-700">{review.text || review.comment}</p>
                                    {review.service && (
                                        <p className="text-xs text-purple-600 mt-2 font-medium">Usługa: {review.service}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}


