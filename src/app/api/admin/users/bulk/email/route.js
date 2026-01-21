import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/app/models/User';
import { sendEmail } from '@/lib/mail';

export async function POST(request) {
    try {
        await connectDB();

        // Auth check (basic, reliant on middleware/token presence usually)
        const token = request.cookies.get('adminToken')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userIds, subject, message } = await request.json();

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json({ error: 'No users selected' }, { status: 400 });
        }

        if (!subject || !message) {
            return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
        }

        // Fetch emails of selected users
        const users = await User.find({ _id: { $in: userIds } }).select('email firstName').lean();

        if (users.length === 0) {
            return NextResponse.json({ error: 'No valid users found' }, { status: 404 });
        }

        let sentCount = 0;
        let failedCount = 0;

        // Using Promise.all for parallel sending, but limiting concurrency might be needed for large batches
        // For now, simpler Promise.allSettled approach
        const emailPromises = users.map(user =>
            sendEmail({
                to: user.email,
                subject: subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        ${message.replace(/\n/g, '<br>')}
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #888;">Wiadomość wysłana przez administratora serwisu Bookly.</p>
                    </div>
                `
            })
        );

        const results = await Promise.allSettled(emailPromises);

        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.success) {
                sentCount++;
            } else {
                failedCount++;
                console.error('Bulk email error:', result.status === 'rejected' ? result.reason : result.value.error);
            }
        });

        // Log audit (simplified)
        // In a real app we'd log this bulk action to AdminLog

        return NextResponse.json({
            success: true,
            sent: sentCount,
            failed: failedCount,
            total: users.length
        });

    } catch (error) {
        console.error('Bulk email API error:', error);
        return NextResponse.json(
            { error: 'Internal server error processing bulk emails' },
            { status: 500 }
        );
    }
}
