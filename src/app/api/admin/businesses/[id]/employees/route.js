import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Business from '@/app/models/Business';
import AdminLog from '@/app/models/AdminLog';
import User from '@/app/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const { employeeId } = await request.json();

        if (!employeeId) {
            return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
        }

        const business = await Business.findById(id);
        if (!business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }

        // Check if employee exists
        const employeeExists = business.employees.some(emp => emp.id === Number(employeeId));
        if (!employeeExists) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        // Remove employee using $pull
        const updatedBusiness = await Business.findByIdAndUpdate(
            id,
            { $pull: { employees: { id: Number(employeeId) } } },
            { new: true }
        );

        // CREATE LOG
        try {
            const token = cookies().get('adminToken')?.value;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const adminUser = await User.findById(decoded.id).select('email adminRole');
                if (adminUser) {
                    await AdminLog.create({
                        userId: adminUser._id,
                        userEmail: adminUser.email,
                        userRole: adminUser.adminRole,
                        action: 'employee_deleted',
                        targetType: 'business',
                        targetId: business._id,
                        details: {
                            businessId: business._id,
                            employeeId: employeeId,
                            businessName: business.companyName
                        },
                        timestamp: new Date()
                    });
                }
            }
        } catch (logError) {
            console.error('Failed to create admin log:', logError);
            // Don't fail the request if logging fails
        }


        return NextResponse.json({
            message: 'Employee deleted successfully',
            employees: updatedBusiness.employees
        });

    } catch (error) {
        console.error('Error deleting employee:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
