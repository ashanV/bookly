import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Business from '@/app/models/Business';

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || 'all'; // all, active, blocked
        const verified = searchParams.get('verified') || 'all'; // all, verified, pending
        const city = searchParams.get('city') || '';
        const category = searchParams.get('category') || '';
        const sort = searchParams.get('sort') || 'date_desc';

        const query = {};

        // Search (Name, email, phone)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { companyName: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { firstName: searchRegex },
                { lastName: searchRegex }
            ];
        }

        // Filters
        if (status !== 'all') {
            if (status === 'blocked') {
                query.isBlocked = true;
            } else {
                query.isActive = status === 'active';
                // Optional: valid active businesses usually aren't blocked, but we can leave isBlocked undefined 
                // or explicitly say query.isBlocked = { $ne: true } if we want strictly active non-blocked.
                // Let's assume 'active' status filter refers to the isActive flag primarily.
            }
        }

        if (verified !== 'all') {
            query.isVerified = verified === 'verified';
        }

        if (city) {
            query.city = new RegExp(city, 'i');
        }

        if (category) {
            query.category = category;
        }

        // Sort
        let sortOptions = {};
        switch (sort) {
            case 'date_asc':
                sortOptions = { createdAt: 1 };
                break;
            case 'date_desc':
                sortOptions = { createdAt: -1 };
                break;
            case 'rating_desc':
                sortOptions = { createdAt: -1 }; // Fallback to date sort if complex aggregation is tricky, but kept aggregation logic below
                break;
            case 'rating_asc':
                sortOptions = { createdAt: 1 };
                break;
            default:
                sortOptions = { createdAt: -1 };
        }

        // Aggregation pipeline for advanced sorting (Rating) or standard find
        let businesses;
        let total;

        // We need aggregation to compute average rating for sorting
        if (sort === 'rating_desc' || sort === 'rating_asc') {
            const pipeline = [
                { $match: query },
                {
                    $addFields: {
                        averageRating: { $avg: "$reviews.rating" },
                        reviewsCount: { $size: "$reviews" }
                    }
                },
                { $sort: { averageRating: sort === 'rating_desc' ? -1 : 1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit }
            ];

            businesses = await Business.aggregate(pipeline);

            // For total count with aggregation match
            const countResult = await Business.aggregate([
                { $match: query },
                { $count: "total" }
            ]);
            total = countResult.length > 0 ? countResult[0].total : 0;

        } else {
            // Standard Find
            businesses = await Business.find(query)
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            // Add calculated fields for the frontend
            businesses = businesses.map(biz => {
                const reviewsCount = biz.reviews?.length || 0;
                const totalRating = biz.reviews?.reduce((acc, r) => acc + r.rating, 0) || 0;
                const averageRating = reviewsCount > 0 ? (totalRating / reviewsCount).toFixed(1) : 0;
                return {
                    ...biz,
                    averageRating,
                    reviewsCount
                };
            });

            total = await Business.countDocuments(query);
        }

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            businesses,
            pagination: {
                total,
                page,
                totalPages,
                limit
            }
        });

    } catch (error) {
        console.error('Error fetching businesses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch businesses' },
            { status: 500 }
        );
    }
}
