/**
* Generates a unique 8-digit reference number for the reservation
* Format: 8 digits (e.g., 86622830)
*/
export async function generateReferenceNumber(Reservation) {
  let referenceNumber;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate 8-digit number: combination of timestamp and random digits
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // Use last 4 digits of timestamp + 4 random digits
    const numStr = (timestamp.slice(-4) + random).slice(0, 8);
    referenceNumber = numStr.padStart(8, '0');

    // Check if the number is unique
    const existing = await Reservation.findOne({ referenceNumber });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Nie udało się wygenerować unikalnego numeru referencyjnego');
  }

  return referenceNumber;
}

