import { Resend } from "resend";
import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { csrfMiddleware } from "@/lib/csrf";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  // Rate limiting check
  const rateLimit = checkRateLimit(request, 'contact');
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  // CSRF validation
  const csrfError = await csrfMiddleware(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
  }

  try {
    const body = await request.json();
    const {
      name,
      email,
      company,
      phone,
      businessType,
      subject,
      message
    } = body;

    // Walidacja wymaganych pól
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Pola: imię i nazwisko, email, temat i wiadomość są wymagane." },
        { status: 400 }
      );
    }

    // Walidacja formatu email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Podaj prawidłowy adres email." },
        { status: 400 }
      );
    }

    // Przygotowanie treści emaila
    const emailContent = `
📧 Nowa wiadomość z formularza kontaktowego Bookly

👤 DANE KONTAKTOWE:
• Imię i nazwisko: ${name}
• Email: ${email}
${company ? `• Firma: ${company}` : ''}
${phone ? `• Telefon: ${phone}` : ''}
${businessType ? `• Rodzaj biznesu: ${businessType}` : ''}

📝 TREŚĆ WIADOMOŚCI:
Temat: ${subject}

${message}

---
Wiadomość została wysłana z formularza kontaktowego na stronie Bookly.
Data: ${new Date().toLocaleString('pl-PL')}
    `;

    // Wysyłka emaila do administratora
    const adminEmailData = await resend.emails.send({
      from: "Bookly Contact Form <onboarding@resend.dev>", // ⚠️ Zmień na swoją domenę
      to: "app.online3@op.pl", // ⚠️ Zmień na swój email kontaktowy
      subject: `🔔 Nowe zapytanie od ${name} - ${subject}`,
      reply_to: email,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📧 Nowa wiadomość z Bookly</h1>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">👤 Dane kontaktowe</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Imię i nazwisko:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${name}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${email}">${email}</a></td></tr>
              ${company ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Firma:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${company}</td></tr>` : ''}
              ${phone ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Telefon:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${phone}</td></tr>` : ''}
              ${businessType ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Rodzaj biznesu:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${businessType}</td></tr>` : ''}
            </table>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">📝 Wiadomość</h2>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
              <strong>Temat:</strong> ${subject}
            </div>
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px; white-space: pre-wrap; line-height: 1.6;">
${message}
            </div>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 6px; text-align: center; color: #6b7280; font-size: 14px;">
            Wiadomość wysłana z formularza kontaktowego Bookly<br>
            Data: ${new Date().toLocaleString('pl-PL')}
          </div>
        </div>
      `
    });

    // Wysyłka emaila potwierdzającego do klienta
    const clientEmailData = await resend.emails.send({
      from: "Bookly Support <onboarding@resend.dev>", // ⚠️ Zmień na swoją domenę
      to: email,
      subject: "✅ Potwierdzenie otrzymania wiadomości - Bookly",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">✅ Dziękujemy za kontakt!</h1>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Cześć ${name}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Dziękujemy za wysłanie wiadomości przez formularz kontaktowy Bookly. 
              Otrzymaliśmy Twoje zapytanie i odpowiemy na nie w ciągu <strong>15 minut</strong> w godzinach roboczych.
            </p>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">Podsumowanie Twojej wiadomości:</h3>
              <p style="margin: 5px 0; color: #1f2937;"><strong>Temat:</strong> ${subject}</p>
              <p style="margin: 5px 0; color: #1f2937;"><strong>Email kontaktowy:</strong> ${email}</p>
              ${company ? `<p style="margin: 5px 0; color: #1f2937;"><strong>Firma:</strong> ${company}</p>` : ''}
            </div>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">📞 Inne sposoby kontaktu</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 15px;">
              <div style="flex: 1; min-width: 200px; background: #f9fafb; padding: 15px; border-radius: 6px;">
                <strong style="color: #059669;">💬 Live Chat</strong><br>
                <span style="color: #6b7280; font-size: 14px;">Dostępny 24/7 na naszej stronie</span>
              </div>
              <div style="flex: 1; min-width: 200px; background: #f9fafb; padding: 15px; border-radius: 6px;">
                <strong style="color: #3b82f6;">📞 Telefon</strong><br>
                <span style="color: #6b7280; font-size: 14px;">+48 22 123 45 67</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 6px; text-align: center; color: #6b7280; font-size: 14px;">
            Zespół Bookly<br>
            <a href="https://bookly.pl" style="color: #3b82f6;">bookly.pl</a>
          </div>
        </div>
      `
    });

    console.log("Emails sent successfully:", { adminEmailData, clientEmailData });

    return NextResponse.json(
      {
        success: true,
        message: "Wiadomość została wysłana pomyślnie!"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Błąd wysyłki emaila:", error);

    return NextResponse.json(
      {
        error: "Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie lub skontaktuj się bezpośrednio."
      },
      { status: 500 }
    );
  }
}