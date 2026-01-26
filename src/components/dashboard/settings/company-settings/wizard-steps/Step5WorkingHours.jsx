import React from 'react';
import { Activity } from 'lucide-react';
import WorkingHoursEditor from '@/components/dashboard/settings/company-settings/WorkingHoursEditor';

export default function Step5WorkingHours({ formData, handleChange }) {
    return (
        <div className="animate-fade-in text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity size={32} className="text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Godziny otwarcia</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Ustaw godziny pracy dla tej lokalizacji. Możesz je później dowolnie zmieniać w ustawieniach.
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-left max-w-2xl mx-auto">
                <WorkingHoursEditor
                    value={formData.workingHours}
                    onChange={(newHours) => handleChange('workingHours', newHours)}
                />
            </div>
        </div>
    );
}
