import {
    Scissors, HandMetal, Eye, Sparkles,
    User, Activity, Waves, Flame, Heart, Sun, Dumbbell,
    Stethoscope, Dog, LayoutGrid, Syringe
} from 'lucide-react';

export const INDUSTRIES = [
    { id: 'hair', label: 'Salon fryzjerski', icon: Scissors },
    { id: 'nails', label: 'Paznokcie', icon: HandMetal },
    { id: 'brows', label: 'Brwi i rzęsy', icon: Eye },
    { id: 'beauty', label: 'Salon kosmetyczny', icon: Sparkles },
    { id: 'medspa', label: 'Medspa', icon: Syringe },
    { id: 'barber', label: 'Barber', icon: User },
    { id: 'massage', label: 'Masaż', icon: Activity },
    { id: 'spa', label: 'Spa i sauna', icon: Waves },
    { id: 'waxing', label: 'Salon depilacji woskiem', icon: Flame },
    { id: 'tattoo', label: 'Tatuaże i piercing', icon: Heart },
    { id: 'tanning', label: 'Studio opalania', icon: Sun },
    { id: 'fitness', label: 'Fitness i regeneracja', icon: Dumbbell },
    { id: 'physio', label: 'Fizjoterapia', icon: Activity },
    { id: 'medical', label: 'Gabinet lekarski', icon: Stethoscope },
    { id: 'pet', label: 'Pielęgnacja zwierząt', icon: Dog },
    { id: 'other', label: 'Inny', icon: LayoutGrid }
];
