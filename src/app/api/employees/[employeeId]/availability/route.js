import { connectDB } from "@/lib/mongodb";
import Business from "@/app/models/Business";
import Reservation from "@/app/models/Reservation";
import { NextResponse } from "next/server";
import { format, addMinutes, getDay, startOfDay, parseISO, isBefore, isAfter, isWithinInterval } from "date-fns";

// Mapping of days of the week (0 = Sunday, 1 = Monday, ...)
const dayMapping = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
};

export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { employeeId } = await params;
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');
    const date = searchParams.get('date'); // Format: YYYY-MM-DD

    if (!businessId || !date || !employeeId) {
      return NextResponse.json(
        { error: "Brak wymaganych parametrów: businessId, date, employeeId" },
        { status: 400 }
      );
    }

    // Retrieving business and employee
    const business = await Business.findById(businessId);
    if (!business) {
      return NextResponse.json({ error: "Biznes nie znaleziony" }, { status: 404 });
    }

    const employee = business.employees?.find(emp => emp.id === parseInt(employeeId));
    if (!employee) {
      return NextResponse.json({ error: "Pracownik nie znaleziony" }, { status: 404 });
    }

    // Checking employee availability
    const selectedDate = parseISO(date);
    const dayOfWeek = getDay(selectedDate);
    const dayKey = dayMapping[dayOfWeek];
    
    const dayAvailability = employee.availability?.[dayKey];
    
    if (!dayAvailability || dayAvailability.closed) {
      return NextResponse.json({ availableSlots: [] }, { status: 200 });
    }

    // Checking vacations
    const isOnVacation = employee.vacations?.some(vacation => {
      const startDate = parseISO(vacation.startDate);
      const endDate = parseISO(vacation.endDate);
      return isWithinInterval(selectedDate, { start: startDate, end: endDate });
    });

    if (isOnVacation) {
      return NextResponse.json({ availableSlots: [] }, { status: 200 });
    }

    // Generating available time slots
    const openTime = dayAvailability.open || '09:00';
    const closeTime = dayAvailability.close || '17:00';
    
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    const startTime = new Date(selectedDate);
    startTime.setHours(openHour, openMinute, 0, 0);
    
    const endTime = new Date(selectedDate);
    endTime.setHours(closeHour, closeMinute, 0, 0);

    // Retrieving existing reservations for this employee on this day
    const dayStart = startOfDay(selectedDate);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    // Checking reservations for this employee (employeeId can be string or number)
    const employeeIdStr = employeeId.toString();
    const employeeIdNum = parseInt(employeeId);
    
    const existingReservations = await Reservation.find({
      businessId: businessId,
      date: {
        $gte: dayStart,
        $lte: dayEnd
      },
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { employeeId: employeeIdStr },
        { employeeId: employeeIdNum.toString() }
      ]
    }).lean();

    // Checking employee breaks on this day
    const breaksForDay = employee.breaks?.filter(br => br.day === dayKey) || [];
    
    // Generating slots (every 30 minutes)
    const slots = [];
    let currentTime = new Date(startTime);
    const slotDuration = 30; // 30 minut

    while (currentTime < endTime) {
      const timeString = format(currentTime, 'HH:mm');
      
      // Checking if the slot does not conflict with a break
      const isInBreak = breaksForDay.some(br => {
        const breakStart = parseISO(`${date}T${br.startTime}`);
        const breakEnd = parseISO(`${date}T${br.endTime}`);
        const slotStart = new Date(currentTime);
        const slotEnd = addMinutes(currentTime, slotDuration);
        
        return slotStart < breakEnd && slotEnd > breakStart;
      });

      if (!isInBreak) {
        // Checking if the slot does not conflict with an existing reservation
        const conflictsWithReservation = existingReservations.some(res => {
          const resTime = parseISO(`${format(new Date(res.date), 'yyyy-MM-dd')}T${res.time}`);
          const resEnd = addMinutes(resTime, res.duration || 60);
          const slotStart = new Date(currentTime);
          const slotEnd = addMinutes(currentTime, slotDuration);
          
          return slotStart < resEnd && slotEnd > resTime;
        });

        if (!conflictsWithReservation) {
          slots.push(timeString);
        }
      }

      currentTime = addMinutes(currentTime, slotDuration);
    }

    return NextResponse.json({ availableSlots: slots }, { status: 200 });
  } catch (error) {
    console.error("Błąd pobierania dostępności pracownika:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}

