import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Reservation from '@/app/models/Reservation';
import Business from '@/app/models/Business';
import User from '@/app/models/User';
import Conversation from '@/app/models/Conversation';
// import ChatMessage from '@/app/models/ChatMessage'; // Import if needed, but we can query raw collection for speed

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        await connectDB();
        const issues = [];

        // 1. Orphaned Reservations (Missing Business)
        // Find reservations where businessId does not exist in Business collection
        const distinctBusinessIds = await Reservation.distinct('businessId');
        const existingBusinesses = await Business.find({ _id: { $in: distinctBusinessIds } }).select('_id');
        const existingBusinessIds = new Set(existingBusinesses.map(b => b._id.toString()));

        const orphanedReservationBusinessIds = distinctBusinessIds.filter(id => !existingBusinessIds.has(id.toString()));

        if (orphanedReservationBusinessIds.length > 0) {
            const count = await Reservation.countDocuments({ businessId: { $in: orphanedReservationBusinessIds } });
            issues.push({
                type: 'orphaned_reservation_business',
                severity: 'high',
                message: `Found ${count} reservations linked to non-existent businesses`,
                details: { count, ids: orphanedReservationBusinessIds.slice(0, 10) }
            });
        }

        // 2. Orphaned Reservations (Missing User when clientId is set)
        // Only check where clientId is NOT null
        const distinctClientIds = await Reservation.distinct('clientId', { clientId: { $ne: null } });
        // Filter out any potential non-ObjectId strings causing errors, although schema type is ObjectId
        const validClientIds = distinctClientIds.filter(id => id);

        if (validClientIds.length > 0) {
            const existingUsers = await User.find({ _id: { $in: validClientIds } }).select('_id');
            const existingUserIds = new Set(existingUsers.map(u => u._id.toString()));

            const orphanedReservationClientIds = validClientIds.filter(id => !existingUserIds.has(id.toString()));

            if (orphanedReservationClientIds.length > 0) {
                const count = await Reservation.countDocuments({ clientId: { $in: orphanedReservationClientIds } });
                issues.push({
                    type: 'orphaned_reservation_user',
                    severity: 'medium',
                    message: `Found ${count} reservations linked to non-existent users`,
                    details: { count, ids: orphanedReservationClientIds.slice(0, 10) }
                });
            }
        }

        // 3. Orphaned Conversations (Missing User/Business based on userType)
        // NOTE: This can be complex depending on userType logic. Simplified check for now.
        // Check conversations where userType is 'client' or 'user' and verify userId exists in User
        const userConversations = await Conversation.find({ userType: { $in: ['user', 'client'] }, userId: { $ne: null } }).select('userId');
        const userConversationIds = [...new Set(userConversations.map(c => c.userId))].filter(Boolean); // deduplicate

        if (userConversationIds.length > 0) {
            try {
                const existingConvUsers = await User.find({ _id: { $in: userConversationIds } }).select('_id');
                const existingConvUserIds = new Set(existingConvUsers.map(u => u._id.toString()));
                const orphanedConvUserIds = userConversationIds.filter(id => !existingConvUserIds.has(id.toString()));

                if (orphanedConvUserIds.length > 0) {
                    issues.push({
                        type: 'orphaned_conversation_user',
                        severity: 'medium',
                        message: `Found conversations linked to non-existent users (${orphanedConvUserIds.length} IDs)`,
                        details: { count: orphanedConvUserIds.length, ids: orphanedConvUserIds.slice(0, 10) }
                    });
                }
            } catch (err) {
                console.error("Error checking conversation users:", err);
                // Continue without crashing
            }
        }

        // Check conversations where userType is 'business' and verify userId exists in Business
        const businessConversations = await Conversation.find({ userType: 'business', userId: { $ne: null } }).select('userId');
        const businessConversationIds = [...new Set(businessConversations.map(c => c.userId))].filter(Boolean);

        if (businessConversationIds.length > 0) {
            try {
                const existingConvBusinesses = await Business.find({ _id: { $in: businessConversationIds } }).select('_id');
                const existingConvBusinessIds = new Set(existingConvBusinesses.map(b => b._id.toString()));
                const orphanedConvBusinessIds = businessConversationIds.filter(id => !existingConvBusinessIds.has(id.toString()));

                if (orphanedConvBusinessIds.length > 0) {
                    issues.push({
                        type: 'orphaned_conversation_business',
                        severity: 'medium',
                        message: `Found conversations linked to non-existent businesses (${orphanedConvBusinessIds.length} IDs)`,
                        details: { count: orphanedConvBusinessIds.length, ids: orphanedConvBusinessIds.slice(0, 10) }
                    });
                }
            } catch (err) {
                console.error("Error checking conversation businesses:", err);
            }
        }


        return NextResponse.json({ issues, timestamp: new Date() });
    } catch (error) {
        console.error('Integrity check error:', error);
        return NextResponse.json(
            { error: 'Failed to run integrity checks' },
            { status: 500 }
        );
    }
}
