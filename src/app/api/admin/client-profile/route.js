import { connectDB } from "@/lib/mongodb";
import User from "@/app/models/User";
import Client from "@/app/models/Client";
import Business from "@/app/models/Business";
import Reservation from "@/app/models/Reservation";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
    try {
        await connectDB();

        // 1. Auth Check (Admin only)
        const token = req.cookies.get('adminToken')?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') throw new Error('Not admin');
        } catch (e) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const email = searchParams.get('email');
        const userType = searchParams.get('userType');

        if (!userId && !email) {
            return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
        }

        // 2. Find Profile based on userType
        let profile = null;
        let queryEmail = email;

        if (userId) {
            if (userType === 'business') {
                const business = await Business.findById(userId).lean();
                if (business) {
                    profile = {
                        id: business._id,
                        name: business.companyName,
                        email: business.email,
                        phone: business.phone,
                        avatar: business.profileImage || '',
                        registeredAt: business.createdAt,
                        type: 'business'
                    };
                    if (!queryEmail) queryEmail = business.email;
                }
            } else {
                // Try User first (for 'user', 'client' or undefined)
                let user = await User.findById(userId).lean();
                if (!user) {
                    // Try Client
                    user = await Client.findById(userId).lean();
                }

                if (user) {
                    profile = {
                        id: user._id,
                        name: user.name || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Nieznany'),
                        email: user.email,
                        phone: user.phone || user.clientPhone || '',
                        avatar: user.avatar || '',
                        registeredAt: user.createdAt,
                        type: 'user'
                    };
                    if (!queryEmail) queryEmail = user.email;
                }
            }
        }

        // If no profile found by ID but we have email, try finding by email
        if (!profile && queryEmail) {
            if (userType === 'business') {
                const business = await Business.findOne({ email: queryEmail }).lean();
                if (business) {
                    profile = {
                        id: business._id,
                        name: business.companyName,
                        email: business.email,
                        phone: business.phone,
                        avatar: business.profileImage || '',
                        registeredAt: business.createdAt,
                        type: 'business'
                    };
                }
            } else {
                let user = await User.findOne({ email: queryEmail }).lean();
                if (!user) {
                    user = await Client.findOne({ email: queryEmail }).lean();
                }

                if (user) {
                    profile = {
                        id: user._id,
                        name: user.name || `${user.firstName} ${user.lastName}`,
                        email: user.email,
                        phone: user.phone || '',
                        avatar: user.avatar || '',
                        registeredAt: user.createdAt,
                        type: 'user'
                    };
                }
            }
        }

        // Fallback for anonymous
        if (!profile) {
            profile = {
                name: 'Gość',
                email: queryEmail || 'Brak emaila',
                isGuest: true
            };
        }

        // 3. Find Reservations
        // Match by ID if available, otherwise by Email
        const resQuery = {};
        if (profile.id && !profile.isGuest) {
            resQuery.$or = [{ clientId: profile.id }, { clientEmail: queryEmail }];
        } else if (queryEmail) {
            resQuery.clientEmail = queryEmail;
        }

        const reservations = await Reservation.find(resQuery)
            .sort({ date: -1 })
            .limit(10)
            .lean();

        // 4. Calculate Stats
        // Note: For a real production app, this should be an aggregation query
        const allReservations = await Reservation.find(resQuery).select('price status').lean();

        const completedRes = allReservations.filter(r => r.status === 'completed');
        const totalSpent = completedRes.reduce((acc, curr) => acc + (curr.price || 0), 0);
        const visitCount = completedRes.length;

        // Simple VIP logic
        const isVip = visitCount >= 5 || totalSpent > 1000;

        return NextResponse.json({
            profile,
            stats: {
                totalSpent,
                visitCount,
                isVip,
                cancelCount: allReservations.filter(r => r.status === 'cancelled').length
            },
            history: reservations.map(r => ({
                id: r._id,
                service: r.service,
                date: r.date,
                time: r.time,
                price: r.price,
                status: r.status
            }))
        });

    } catch (error) {
        console.error("Profile API Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
