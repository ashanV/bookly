# Konfiguracja Google Calendar API

Aby zintegrować kalendarz z Google Calendar, musisz skonfigurować Google Calendar API.

## Kroki konfiguracji:

1. **Utwórz projekt w Google Cloud Console:**
   - Przejdź do [Google Cloud Console](https://console.cloud.google.com/)
   - Utwórz nowy projekt lub wybierz istniejący

2. **Włącz Google Calendar API:**
   - W menu nawigacyjnym wybierz "APIs & Services" > "Library"
   - Wyszukaj "Google Calendar API"
   - Kliknij "Enable"

3. **Utwórz OAuth 2.0 credentials:**
   - Przejdź do "APIs & Services" > "Credentials"
   - Kliknij "Create Credentials" > "OAuth client ID"
   - Wybierz typ aplikacji: "Web application"
   - Dodaj autoryzowane URI przekierowania:
     - Dla development: `http://localhost:3000/api/google-calendar/callback`
     - Dla production: `https://twoja-domena.pl/api/google-calendar/callback`

4. **Pobierz Client ID i Client Secret:**
   - Skopiuj Client ID i Client Secret z utworzonych credentials

5. **Dodaj zmienne środowiskowe:**
   Dodaj następujące zmienne do pliku `.env.local`:
   ```
   GOOGLE_CLIENT_ID=twoj_client_id
   GOOGLE_CLIENT_SECRET=twoj_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-calendar/callback
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

6. **Dla produkcji:**
   - Zaktualizuj `GOOGLE_REDIRECT_URI` i `NEXT_PUBLIC_BASE_URL` na adres produkcyjny
   - Dodaj produkcyjny URL do autoryzowanych URI przekierowania w Google Cloud Console

## Użycie:

1. Zaloguj się jako biznes
2. Przejdź do strony kalendarza (`/business/calendar`)
3. Kliknij "Połącz z Google Calendar"
4. Zaloguj się do konta Google i udziel uprawnień
5. Po połączeniu kliknij "Synchronizuj z Google" aby dodać istniejące rezerwacje do Google Calendar
6. Nowe rezerwacje będą automatycznie synchronizowane z Google Calendar

## Funkcje:

- ✅ Autoryzacja OAuth 2.0 z Google Calendar
- ✅ Automatyczna synchronizacja rezerwacji
- ✅ Wizualne oznaczenie zsynchronizowanych rezerwacji
- ✅ Automatyczne odświeżanie tokenów
- ✅ Tworzenie wydarzeń z pełnymi szczegółami (klient, usługa, czas, cena)


