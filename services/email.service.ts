import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export class EmailService {
  /**
   * Check if email credentials are properly configured
   */
  static isConfigured(): boolean {
    return !!(
      process.env.EMAIL_SERVER_USER &&
      process.env.EMAIL_SERVER_PASSWORD &&
      process.env.EMAIL_SERVER_PASSWORD !== "your_app_password_here"
    );
  }

  private static getTransporter() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  }

  /**
   * Send a contact form email
   */
  static async sendContactEmail(
    name: string,
    email: string,
    message: string
  ) {
    const transporter = this.getTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_SERVER_USER,
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B1D1D;">New Contact Message — TACHÈ</h2>
          <hr style="border: 1px solid #f0f0f0;" />
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Message:</strong></p>
          <div style="background: #f9f7f5; padding: 16px; border-radius: 8px;">
            <p>${message.replace(/\n/g, "<br>")}</p>
          </div>
        </div>
      `,
    });
  }

  /**
   * Send an order confirmation email
   */
  static async sendOrderConfirmation(
    email: string,
    name: string,
    orderId: string,
    artworkType: string
  ) {
    const transporter = this.getTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to: email,
      subject: `Order Confirmation — TACHÈ #${orderId.slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B1D1D;">Thank you, ${name}!</h2>
          <p>Your order request has been received.</p>
          <hr style="border: 1px solid #f0f0f0;" />
          <p><strong>Order ID:</strong> #${orderId.slice(-6).toUpperCase()}</p>
          <p><strong>Type:</strong> ${artworkType}</p>
          <p><strong>Status:</strong> Pending</p>
          <hr style="border: 1px solid #f0f0f0;" />
          <p style="color: #666;">We'll get back to you within 24-48 hours with a quote and next steps.</p>
          <p style="color: #8B1D1D; font-weight: bold;">— TACHÈ Art Studio</p>
        </div>
      `,
    });
  }

  /**
   * Generic send
   */
  static async send(options: EmailOptions) {
    const transporter = this.getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      ...options,
    });
  }
}
