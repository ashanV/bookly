import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/app/models/User';
import mongoose from 'mongoose';

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const sortParam = searchParams.get('sort') || 'createdAt:desc';
        const search = searchParams.get('search') || '';

        // Filters
        const status = searchParams.get('status'); // 'active', 'blocked', 'all'
        const type = searchParams.get('type'); // 'client', 'business', 'all'
        const adminRole = searchParams.get('adminRole'); // 'admin', 'moderator', 'developer', 'none', 'all'
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const lastActive = searchParams.get('lastActive'); // 'today', '7days', '30days', 'inactive'

        const skip = (page - 1) * limit;

        // Build Match Stage
        const matchStage = {};

        // 1. Search (Regex)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            matchStage.$or = [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex },
                { phone: searchRegex }
            ];
        }

        // 2. Status
        if (status && status !== 'all') {
            matchStage.isActive = status === 'active';
        }

        // 3. Admin Role
        if (adminRole && adminRole !== 'all') {
            if (adminRole === 'none') {
                matchStage.adminRole = null;
            } else {
                matchStage.adminRole = adminRole;
            }
        }

        // 4. Date Range
        if (dateFrom || dateTo) {
            matchStage.createdAt = {};
            if (dateFrom) matchStage.createdAt.$gte = new Date(dateFrom);
            if (dateTo) matchStage.createdAt.$lte = new Date(dateTo);
        }

        // 5. Last Activity (Based on lastAdminLogin for now, or updatedAt as fallback?) 
        // Using lastAdminLogin as per prompt "Ostatnie logowanie" context, or we could check updatedAt.
        // Let's stick strictly to lastAdminLogin as "Activity".
        if (lastActive) {
            const now = new Date();
            const getPastDate = (days) => new Date(now.setDate(now.getDate() - days));

            if (lastActive === 'today') {
                matchStage.lastAdminLogin = { $gte: getPastDate(1) };
            } else if (lastActive === '7days') {
                matchStage.lastAdminLogin = { $gte: getPastDate(7) };
            } else if (lastActive === '30days') {
                matchStage.lastAdminLogin = { $gte: getPastDate(30) };
            } else if (lastActive === 'inactive') {
                matchStage.lastAdminLogin = { $eq: null }; // Never logged in
            }
        }

        // Aggregation Pipeline
        const pipeline = [

            // 1. Lookup Businesses to determine User Type
            {
                $lookup: {
                    from: 'businesses',
                    localField: 'email',
                    foreignField: 'email',
                    as: 'userBusinesses'
                }
            },
            // 2. Add 'isBusinessOwner' field
            {
                $addFields: {
                    isBusinessOwner: { $gt: [{ $size: '$userBusinesses' }, 0] }
                }
            },
            // 3. Filter by Type (Client/Business)
            ...(type && type !== 'all' ? [{
                $match: {
                    isBusinessOwner: type === 'business'
                }
            }] : []),

            // 4. Apply Main Filters
            { $match: matchStage },

            // 5. Sort
            {
                $sort: (() => {
                    const [field, order] = sortParam.split(':');
                    return { [field]: order === 'desc' ? -1 : 1 };
                })()
            },

            // 6. Pagination & Count (Facet)
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                password: 0,
                                adminPin: 0,
                                userBusinesses: 0 // Remove joined array to keep response light
                            }
                        }
                    ]
                }
            }
        ];

        const result = await User.aggregate(pipeline);

        const data = result[0].data;
        const total = result[0].metadata[0]?.total || 0;

        // Post-process to ensure compatible role format for frontend
        const usersWithDetails = data.map(user => {
            let computedRole = 'client';
            if (user.adminRole) {
                computedRole = user.adminRole;
            } else if (user.isBusinessOwner) {
                computedRole = 'business';
            }

            return {
                ...user,
                id: user._id.toString(), // Convert ObjectId to string
                role: computedRole
            };
        });

        return NextResponse.json({
            users: usersWithDetails,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
