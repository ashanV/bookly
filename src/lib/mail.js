import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer with SMTP settings from environment variables
 */
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send an email using Nodemailer
 */
export async function sendEmail({ to, subject, html, text }) {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Bookly Admin" <admin@bookly.pl>',
            to,
            subject,
            text: text || html.replace(/<[^>]*>?/gm, ''), // Simple HTML to text fallback
            html,
        });

        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}
