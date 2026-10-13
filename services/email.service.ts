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
    const user = process.env.EMAIL_SERVER_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD;
    return !!(user && pass && pass !== "your_app_password_here");
  }

  private static getTransporter() {
    const user = (process.env.EMAIL_SERVER_USER || "aasthajainokok@gmail.com").trim();
    const pass = (process.env.EMAIL_SERVER_PASSWORD || "").replace(/\s+/g, "");

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  private static getSender(): string {
    const fromEmail = (
      process.env.EMAIL_FROM ||
      process.env.EMAIL_SERVER_USER ||
      "aasthajainokok@gmail.com"
    ).trim();
    return `"TACHÈ Art Studio" <${fromEmail}>`;
  }

  private static getAdminRecipient(): string {
    return (
      process.env.ADMIN_EMAIL ||
      process.env.EMAIL_SERVER_USER ||
      "aasthajainokok@gmail.com"
    ).trim();
  }

  /**
   * Send a contact form email to the admin (aasthajainokok@gmail.com)
   */
  static async sendContactEmail(
    name: string,
    email: string,
    message: string
  ) {
    const transporter = this.getTransporter();
    const adminTo = this.getAdminRecipient();
    const from = this.getSender();

    await transporter.sendMail({
      from,
      to: adminTo,
      replyTo: email,
      subject: `New Contact Form Message from ${name} — TACHÈ`,
      text: `Client Name: ${name}\nClient Email: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e8e3dc; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #fdfbf7; padding: 24px; text-align: center; border-bottom: 2px solid #8B1D1D;">
            <h1 style="color: #8B1D1D; letter-spacing: 4px; margin: 0; font-size: 22px; font-weight: 700;">TACHÈ</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase;">New Contact Form Message</p>
          </div>
          <div style="padding: 24px 28px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 6px 0; color: #666; font-size: 13px; width: 90px; font-weight: 600;">Client:</td>
                <td style="padding: 6px 0; color: #111; font-size: 14px; font-weight: 700;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666; font-size: 13px; font-weight: 600;">Email:</td>
                <td style="padding: 6px 0; color: #111; font-size: 14px;"><a href="mailto:${email}" style="color: #8B1D1D; text-decoration: underline;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666; font-size: 13px; font-weight: 600;">Date:</td>
                <td style="padding: 6px 0; color: #666; font-size: 13px;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
              </tr>
            </table>
            <div style="margin-top: 15px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #8B1D1D; text-transform: uppercase; letter-spacing: 1px;">Message:</p>
              <div style="background-color: #fbf9f6; border-left: 3px solid #8B1D1D; padding: 14px 16px; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #2d2d2d; white-space: pre-wrap;">${message}</div>
            </div>
            <div style="margin-top: 24px; text-align: center;">
              <a href="mailto:${email}?subject=${encodeURIComponent(`Re: Your Inquiry with TACHÈ Art Studio`)}" style="display: inline-block; background-color: #8B1D1D; color: #ffffff; padding: 10px 22px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: 1px;">
                Reply Directly to ${name}
              </a>
            </div>
          </div>
          <div style="background-color: #faf8f5; padding: 14px 20px; border-top: 1px solid #e8e3dc; text-align: center; font-size: 11px; color: #888;">
            <p style="margin: 0;">TACHÈ Art Studio &bull; Notification dispatched to ${adminTo}</p>
          </div>
        </div>
      `,
    });
  }

  /**
   * Send an acknowledgement email to the customer who submitted the contact form
   */
  static async sendContactConfirmation(email: string, name: string) {
    const transporter = this.getTransporter();
    const from = this.getSender();

    await transporter.sendMail({
      from,
      to: email,
      subject: `We received your message — TACHÈ Art Studio`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e8e3dc; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #fdfbf7; padding: 24px; text-align: center; border-bottom: 2px solid #8B1D1D;">
            <h1 style="color: #8B1D1D; letter-spacing: 4px; margin: 0; font-size: 22px; font-weight: 700;">TACHÈ</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase;">Art Studio</p>
          </div>
          <div style="padding: 24px 28px;">
            <h2 style="color: #111; font-size: 18px; margin: 0 0 12px 0;">Thank you for contacting us, ${name}!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #444; margin: 0 0 16px 0;">
              We have received your message and will review it promptly. Our team will get back to you within 24-48 hours.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #444; margin: 0;">
              If you have any urgent questions, you can also reach us on Instagram <a href="https://www.instagram.com/tache.in" style="color: #8B1D1D; text-decoration: underline;">@tache.in</a> or reply directly to this email.
            </p>
          </div>
          <div style="background-color: #faf8f5; padding: 14px 20px; border-top: 1px solid #e8e3dc; text-align: center; font-size: 11px; color: #888;">
            <p style="margin: 0;">Warm regards,<br><strong style="color: #8B1D1D;">TACHÈ Art Studio Team</strong></p>
          </div>
        </div>
      `,
    });
  }

  /**
   * Send an admin notification email for a new custom order request (to aasthajainokok@gmail.com)
   */
  static async sendAdminOrderNotification(
    name: string,
    email: string,
    orderId: string,
    artworkType: string,
    size: string,
    message: string,
    referenceImage?: string,
    phone?: string,
    shippingAddress?: string
  ) {
    const transporter = this.getTransporter();
    const adminTo = this.getAdminRecipient();
    const from = this.getSender();

    await transporter.sendMail({
      from,
      to: adminTo,
      replyTo: email,
      subject: `New Custom Order Request #${orderId.slice(-6).toUpperCase()} from ${name} — TACHÈ`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e8e3dc; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #fdfbf7; padding: 24px; text-align: center; border-bottom: 2px solid #8B1D1D;">
            <h1 style="color: #8B1D1D; letter-spacing: 4px; margin: 0; font-size: 22px; font-weight: 700;">TACHÈ</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase;">Custom Order Commission Request</p>
          </div>
          <div style="padding: 24px 28px;">
            <div style="background-color: #fbf3f3; border: 1px solid #f2dede; padding: 10px 14px; border-radius: 6px; margin-bottom: 18px; text-align: center;">
              <span style="font-size: 12px; color: #8B1D1D; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Order Ref: #${orderId.slice(-6).toUpperCase()}</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
              <tr>
                <td style="padding: 6px 0; color: #666; font-size: 13px; width: 110px; font-weight: 600;">Customer:</td>
                <td style="padding: 6px 0; color: #111; font-size: 14px; font-weight: 700;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666; font-size: 13px; font-weight: 600;">Email:</td>
                <td style="padding: 6px 0; color: #111; font-size: 14px;"><a href="mailto:${email}" style="color: #8B1D1D; text-decoration: underline;">${email}</a></td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 6px 0; color: #666; font-size: 13px; font-weight: 600;">Phone:</td>
                <td style="padding: 6px 0; color: #111; font-size: 14px;">${phone}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 6px 0; color: #666; font-size: 13px; font-weight: 600;">Artwork Type:</td>
                <td style="padding: 6px 0; color: #111; font-size: 14px; font-weight: 600;">${artworkType}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666; font-size: 13px; font-weight: 600;">Preferred Size:</td>
                <td style="padding: 6px 0; color: #111; font-size: 14px;">${size || "Standard"}</td>
              </tr>
              ${shippingAddress ? `
              <tr>
                <td style="padding: 6px 0; color: #666; font-size: 13px; font-weight: 600;">Shipping:</td>
                <td style="padding: 6px 0; color: #111; font-size: 14px;">${shippingAddress}</td>
              </tr>` : ""}
            </table>

            <div style="margin-top: 15px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #8B1D1D; text-transform: uppercase; letter-spacing: 1px;">Customer Vision / Specifications:</p>
              <div style="background-color: #fbf9f6; border-left: 3px solid #8B1D1D; padding: 14px 16px; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #2d2d2d; white-space: pre-wrap;">${message || "No additional message provided."}</div>
            </div>

            ${referenceImage ? `
            <div style="margin-top: 20px; padding: 14px; background: #fdfbf7; border: 1px solid #eae5de; border-radius: 6px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #8B1D1D; text-transform: uppercase; letter-spacing: 1px;">Attached Reference Image:</p>
              <a href="${referenceImage}" target="_blank" style="display: inline-block; color: #8B1D1D; text-decoration: underline; font-size: 13px; font-weight: 600; margin-bottom: 10px;">Click here to view full image</a>
              <div><img src="${referenceImage}" alt="Reference" style="max-width: 100%; max-height: 350px; border-radius: 6px; object-fit: contain; display: block;" /></div>
            </div>
            ` : ""}

            <div style="margin-top: 24px; text-align: center;">
              <a href="mailto:${email}?subject=${encodeURIComponent(`Custom Artwork Quote for Order #${orderId.slice(-6).toUpperCase()} — TACHÈ`)}" style="display: inline-block; background-color: #8B1D1D; color: #ffffff; padding: 10px 22px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: 1px;">
                Send Quote & Next Steps to ${name}
              </a>
            </div>
          </div>
          <div style="background-color: #faf8f5; padding: 14px 20px; border-top: 1px solid #e8e3dc; text-align: center; font-size: 11px; color: #888;">
            <p style="margin: 0;">TACHÈ Art Studio &bull; Notification dispatched to ${adminTo}</p>
          </div>
        </div>
      `,
    });
  }

  /**
   * Send an order confirmation email to the customer
   */
  static async sendOrderConfirmation(
    email: string,
    name: string,
    orderId: string,
    artworkType: string
  ) {
    const transporter = this.getTransporter();
    const from = this.getSender();

    await transporter.sendMail({
      from,
      to: email,
      subject: `Order Confirmation — TACHÈ #${orderId.slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e8e3dc; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #fdfbf7; padding: 24px; text-align: center; border-bottom: 2px solid #8B1D1D;">
            <h1 style="color: #8B1D1D; letter-spacing: 4px; margin: 0; font-size: 22px; font-weight: 700;">TACHÈ</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase;">Art Studio</p>
          </div>
          <div style="padding: 24px 28px;">
            <h2 style="color: #8B1D1D; margin: 0 0 12px 0; font-size: 18px;">Thank you, ${name}!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #444; margin: 0 0 16px 0;">
              Your order commission request has been received by our studio.
            </p>
            <div style="background-color: #fbf9f6; border: 1px solid #e8e3dc; border-radius: 6px; padding: 14px 18px; margin-bottom: 18px;">
              <p style="margin: 4px 0; font-size: 13px;"><strong>Order ID:</strong> #${orderId.slice(-6).toUpperCase()}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Type:</strong> ${artworkType}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Status:</strong> Pending Review</p>
            </div>
            <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0;">
              We will review your vision and get back to you within 24-48 hours with a customized quote and next steps.
            </p>
          </div>
          <div style="background-color: #faf8f5; padding: 14px 20px; border-top: 1px solid #e8e3dc; text-align: center; font-size: 11px; color: #888;">
            <p style="margin: 0;">Warm regards,<br><strong style="color: #8B1D1D;">TACHÈ Art Studio</strong></p>
          </div>
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
    const from = this.getSender();

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
      from,
      to: email,
      subject: `Order Update: ${newStatus.toUpperCase()} — TACHÈ #${orderId.slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e8e3dc; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #fdfbf7; padding: 24px; text-align: center; border-bottom: 2px solid #8B1D1D;">
            <h1 style="color: #8B1D1D; letter-spacing: 4px; margin: 0; font-size: 22px; font-weight: 700;">TACHÈ</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase;">Art Studio</p>
          </div>
          <div style="padding: 24px 28px;">
            <h2 style="color: #8B1D1D; margin: 0 0 12px 0; font-size: 18px;">Order Update</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #444;">Hi ${name},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #444;">${statusMessage}</p>
            <div style="background-color: #fbf9f6; border: 1px solid #e8e3dc; border-radius: 6px; padding: 14px 18px; margin: 16px 0;">
              <p style="margin: 4px 0; font-size: 13px;"><strong>Order ID:</strong> #${orderId.slice(-6).toUpperCase()}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Type:</strong> ${artworkType}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>New Status:</strong> ${newStatus.toUpperCase()}</p>
            </div>
            <p style="color: #666; font-size: 13px; line-height: 1.6; margin: 0;">You can view the full details on your Buyer Registry page.</p>
          </div>
          <div style="background-color: #faf8f5; padding: 14px 20px; border-top: 1px solid #e8e3dc; text-align: center; font-size: 11px; color: #888;">
            <p style="margin: 0;">Warm regards,<br><strong style="color: #8B1D1D;">TACHÈ Art Studio</strong></p>
          </div>
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
      from: this.getSender(),
      ...options,
    });
  }
}
