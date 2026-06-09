import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send email using Resend
    // Note: During testing, Resend only allows sending to your verified email address
    // To send to other recipients, verify a domain at resend.com/domains
    // and update the 'from' address to use your verified domain
    const { data, error } = await resend.emails.send({
      from: 'ToolForge Contact <onboarding@resend.dev>',
      to: 'toolforgewebsite@gmail.com', // Your verified email address
      subject: `New Contact Form Message from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Message</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; border-bottom: 1px solid #e2e8f0;">
                      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                          <span style="font-size: 24px; color: white;">✨</span>
                        </div>
                        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1e293b;">ToolForge</h1>
                      </div>
                      <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 600; color: #6366f1;">New Contact Form Message</h2>
                      <p style="margin: 0; font-size: 15px; color: #64748b; line-height: 1.6;">You have received a new message from your website's contact form.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px 40px;">
                      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
                        <div style="margin-bottom: 16px;">
                          <span style="display: block; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">From</span>
                          <span style="font-size: 16px; font-weight: 600; color: #1e293b;">${name}</span>
                        </div>
                        <div style="margin-bottom: 16px;">
                          <span style="display: block; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Email</span>
                          <a href="mailto:${email}" style="font-size: 16px; color: #6366f1; text-decoration: none; font-weight: 500;">${email}</a>
                        </div>
                        <div>
                          <span style="display: block; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Message</span>
                          <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px 40px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
                      <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                        This message was sent from the <a href="https://www.toolforge.website/contact" style="color: #6366f1; text-decoration: none; font-weight: 500;">ToolForge contact form</a>.
                      </p>
                      <p style="margin: 8px 0 0 0; font-size: 12px; color: #cbd5e1;">
                        © ${new Date().getFullYear()} ToolForge. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      replyTo: email,
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Message sent successfully!', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
