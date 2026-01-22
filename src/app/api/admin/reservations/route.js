
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Reservation from '@/app/models/Reservation';
import mongoose from 'mongoose';

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const sortParam = searchParams.get('sort') || 'createdAt:desc';
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');

        const skip = (page - 1) * limit;

        // Build Match Stage
        const matchStage = {};

        // 1. Search (Regex on multiple fields)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            matchStage.$or = [
                { clientName: searchRegex },
                { clientEmail: searchRegex },
                { referenceNumber: searchRegex },
                { service: searchRegex }
            ];
        }

        // 2. Status
        if (status && status !== 'all') {
            matchStage.status = status;
        }

        // 3. Date Range
        if (dateFrom || dateTo) {
            matchStage.date = {};
            if (dateFrom) matchStage.date.$gte = new Date(dateFrom);
            if (dateTo) matchStage.date.$lte = new Date(dateTo);
        }

        const pipeline = [
            // 1. Lookup Business details
            {
                $lookup: {
                    from: 'businesses',
                    localField: 'businessId',
                    foreignField: '_id',
                    as: 'business'
                }
            },
            {
                $unwind: {
                    path: '$business',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'employeeId',
                    foreignField: '_id',
                    as: 'employee'
                }
            },
            {
                $unwind: {
                    path: '$employee',
                    preserveNullAndEmptyArrays: true
                }
            },

            // 2. Main Match
            { $match: matchStage },

            // 3. Sort
            {
                $sort: (() => {
                    const [field, order] = sortParam.split(':');
                    // Handle special sort fields if necessary, otherwise default
                    let sortField = field;
                    if (field === 'client') sortField = 'clientName';
                    if (field === 'business') sortField = 'business.name';

                    return { [sortField]: order === 'desc' ? -1 : 1 };
                })()
            },

            // 4. Pagination & Count
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                referenceNumber: 1,
                                clientName: 1,
                                clientEmail: 1,
                                clientPhone: 1,
                                service: 1,
                                date: 1,
                                time: 1,
                                duration: 1,
                                price: 1,
                                paymentMethod: 1,
                                status: 1,
                                employee: {
                                    _id: 1,
                                    firstName: 1,
                                    lastName: 1
                                },
                                createdAt: 1,
                                business: {
                                    _id: 1,
                                    name: 1
                                }
                            }
                        }
                    ]
                }
            }
        ];

        const result = await Reservation.aggregate(pipeline);

        const data = result[0].data;
        const total = result[0].metadata[0]?.total || 0;

        // Post-process to ensure IDs are strings
        const formattedData = data.map(item => ({
            ...item,
            id: item._id.toString(),
            business: item.business ? { ...item.business, id: item.business._id.toString() } : null,
            employee: item.employee ? { ...item.employee, id: item.employee._id.toString() } : null
        }));

        return NextResponse.json({
            reservations: formattedData,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching reservations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reservations' },
            { status: 500 }
        );
    }
}
