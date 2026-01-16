import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Business from '@/app/models/Business';

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

        return NextResponse.json({
            message: 'Employee deleted successfully',
            employees: updatedBusiness.employees
        });

    } catch (error) {
        console.error('Error deleting employee:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
