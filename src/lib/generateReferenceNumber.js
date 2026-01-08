/**
 * Generuje unikalny 8-cyfrowy numer referencyjny dla rezerwacji
 * Format: 8 cyfr (np. 86622830)
 */
export async function generateReferenceNumber(Reservation) {
  let referenceNumber;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generuj 8-cyfrowy numer: kombinacja timestamp i losowych cyfr
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // Użyj ostatnich 4 cyfr timestamp + 4 losowe cyfry
    const numStr = (timestamp.slice(-4) + random).slice(0, 8);
    referenceNumber = numStr.padStart(8, '0');

    // Sprawdź, czy numer jest unikalny
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

