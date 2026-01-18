import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AdminLog from '@/app/models/AdminLog';
import Business from '@/app/models/Business';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        // Fetch logs where targetId is the business ID
        // Also look for logs where details.businessId is the ID (fallback coverage)
        const logs = await AdminLog.find({
            $or: [
                { targetId: id },
                { 'details.businessId': id }
            ]
        })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();

        // Fetch business to get createdAt
        const business = await Business.findById(id).select('createdAt companyName email firstName lastName').lean();

        if (business) {
            // Check if business_created log already exists
            const hasCreationLog = logs.some(log => log.action === 'business_created');

            if (!hasCreationLog) {
                // Synthesize a creation event
                logs.push({
                    _id: 'creation_event_' + business._id,
                    action: 'business_created',
                    targetType: 'business',
                    targetId: business._id,
                    userEmail: business.email, // Or 'System'
                    userRole: 'system', // or business owner
                    timestamp: business.createdAt,
                    details: {
                        companyName: business.companyName,
                        owner: `${business.firstName} ${business.lastName}`
                    }
                });
            }
        }

        // Re-sort by timestamp descending
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return NextResponse.json({
            success: true,
            timeline: logs
        });

    } catch (error) {
        console.error('Error fetching business timeline:', error);
        return NextResponse.json(
            { error: 'Failed to fetch timeline' },
            { status: 500 }
        );
    }
}
