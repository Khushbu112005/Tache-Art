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
   * Send an admin notification email for a new order request
   */
  static async sendAdminOrderNotification(
    name: string,
    email: string,
    orderId: string,
    artworkType: string,
    size: string,
    message: string,
    referenceImage?: string
  ) {
    const transporter = this.getTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_SERVER_USER,
      replyTo: email,
      subject: `New Custom Order Request #${orderId.slice(-6).toUpperCase()} from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B1D1D;">New Order Request — TACHÈ</h2>
          <hr style="border: 1px solid #f0f0f0;" />
          <p><strong>Order ID:</strong> #${orderId.slice(-6).toUpperCase()}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Artwork Type:</strong> ${artworkType}</p>
          <p><strong>Preferred Size:</strong> ${size}</p>
          <p><strong>Message / Vision:</strong></p>
          <div style="background: #f9f7f5; padding: 16px; border-radius: 8px; margin-bottom: 15px;">
            <p>${message.replace(/\n/g, "<br>")}</p>
          </div>
          ${
            referenceImage
              ? `<p><strong>Reference Image:</strong> <a href="${referenceImage}" target="_blank">View Reference Image</a></p>
                 <div style="margin-top: 10px;"><img src="${referenceImage}" alt="Reference" style="max-width: 100%; border-radius: 4px;" /></div>`
              : ""
          }
        </div>
      `,
    });
  }

  /**
   * Send an order status update email
   */
  static async sendStatusUpdateEmail(
    email: string,
    name: string,
    orderId: string,
    artworkType: string,
    newStatus: string
  ) {
    const transporter = this.getTransporter();

    let statusMessage = "";
    if (newStatus === "in-progress") {
      statusMessage = "Good news! We have started working on your custom request.";
    } else if (newStatus === "completed") {
      statusMessage = "Your custom artwork is completed and ready!";
    } else if (newStatus === "cancelled") {
      statusMessage = "Your order request has been cancelled.";
    } else {
      statusMessage = `Your order status has been updated to: ${newStatus}`;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to: email,
      subject: `Order Update: ${newStatus.toUpperCase()} — TACHÈ #${orderId.slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B1D1D;">Order Update</h2>
          <p>Hi ${name},</p>
          <p>${statusMessage}</p>
          <hr style="border: 1px solid #f0f0f0;" />
          <p><strong>Order ID:</strong> #${orderId.slice(-6).toUpperCase()}</p>
          <p><strong>Type:</strong> ${artworkType}</p>
          <p><strong>New Status:</strong> ${newStatus.toUpperCase()}</p>
          <hr style="border: 1px solid #f0f0f0;" />
          <p style="color: #666;">You can view the full details on your Buyer Registry page.</p>
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
