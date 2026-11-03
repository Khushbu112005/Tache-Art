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
      statusMessage = "Good news! Your order is confirmed and in progress. Our studio team is preparing your artwork and it will be delivered to your address soon!";
    } else if (newStatus === "completed") {
      statusMessage = "Your artwork is completed / dispatched and is on its way to you!";
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
              <p style="margin: 4px 0; font-size: 13px;"><strong>Status:</strong> ${newStatus.toUpperCase()}</p>
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
   * Send an email to the customer when admin approves their payment
   */
  static async sendPaymentApprovedEmail(options: {
    to: string;
    customerName: string;
    orderId: string;
    artworkTitle: string;
    amount: number;
    utrNumber?: string;
    shippingAddress?: string;
  }) {
    const { to, customerName, orderId, artworkTitle, amount, utrNumber, shippingAddress } = options;
    const transporter = this.getTransporter();
    const from = this.getSender();
    const orderRef = orderId.slice(-6).toUpperCase();
    const safeName = this.escapeHtml(customerName || "Collector");
    const safeTitle = this.escapeHtml(artworkTitle || "Artwork Acquisition");
    const safeAddress = this.escapeHtml(shippingAddress || "As provided during checkout");
    const safeUtr = this.escapeHtml(utrNumber || "Verified");

    let siteUrl = (
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "https://tacheart.vercel.app"
    ).trim().replace(/\/$/, "");

    if (siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1")) {
      siteUrl = "https://tacheart.vercel.app";
    }

    const ordersUrl = `${siteUrl}/user/orders`;

    await transporter.sendMail({
      from,
      to,
      subject: `Payment Approved & Order Confirmed: #${orderRef} — TACHÈ Art Studio`,
      text: `Hello ${customerName},\n\nGreat news! Your payment of ₹${amount.toLocaleString("en-IN")} has been verified and approved by our studio.\n\nYour order #${orderRef} is now confirmed and will be carefully packaged and delivered soon!\n\nOrder Details:\n• Order ID: #${orderRef}\n• Artwork: ${artworkTitle}\n• Amount: ₹${amount.toLocaleString("en-IN")}\n• UTR / Reference: ${utrNumber || "Verified"}\n• Shipping To: ${shippingAddress || "As provided"}\n• Status: Confirmed & Preparing for Delivery\n\nYou can track your order status anytime at:\n${ordersUrl}\n\nWarm regards,\nTACHÈ Art Studio Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e8e3dc; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #fdfbf7; padding: 24px; text-align: center; border-bottom: 2px solid #8B1D1D;">
            <h1 style="color: #8B1D1D; letter-spacing: 4px; margin: 0; font-size: 22px; font-weight: 700;">TACHÈ</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase;">Art Studio</p>
          </div>
          <div style="padding: 26px 28px;">
            <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; padding: 4px 14px; margin-bottom: 14px;">
              <span style="font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 1px;">✓ Payment Verified & Approved</span>
            </div>
            <h2 style="color: #1a161a; margin: 0 0 10px 0; font-size: 20px;">Your Order Will Be Delivered Soon!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #444; margin: 0 0 18px 0;">
              Hello <strong>${safeName}</strong>, thank you for your acquisition. We have verified your payment of <strong style="color: #8B1D1D;">₹${amount.toLocaleString("en-IN")}</strong>. Your order is now officially confirmed and will be delivered soon.
            </p>

            <div style="background-color: #fbf9f6; border: 1px solid #e8e3dc; border-radius: 8px; padding: 18px 20px; margin-bottom: 22px;">
              <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; color: #8B1D1D; text-transform: uppercase; letter-spacing: 1.5px;">Order & Delivery Details</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #666; font-weight: 600; width: 120px;">Order Reference:</td>
                  <td style="padding: 6px 0; color: #111; font-weight: 700;">#${orderRef}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #666; font-weight: 600;">Artwork:</td>
                  <td style="padding: 6px 0; color: #111; font-weight: 600;">${safeTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #666; font-weight: 600;">Amount Paid:</td>
                  <td style="padding: 6px 0; color: #047857; font-weight: 700; font-size: 14px;">₹${amount.toLocaleString("en-IN")}</td>
                </tr>
                ${utrNumber ? `
                <tr>
                  <td style="padding: 6px 0; color: #666; font-weight: 600;">UTR Number:</td>
                  <td style="padding: 6px 0; color: #444; font-family: monospace;">${safeUtr}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding: 6px 0; color: #666; font-weight: 600;">Shipping To:</td>
                  <td style="padding: 6px 0; color: #111;">${safeAddress}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #666; font-weight: 600;">Status:</td>
                  <td style="padding: 6px 0; color: #8B1D1D; font-weight: 700;">Confirmed & Preparing for Dispatch</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #f7fafc; border: 1px solid #edf2f7; border-left: 3px solid #8B1D1D; padding: 14px 16px; border-radius: 4px; margin-bottom: 22px;">
              <p style="margin: 0; font-size: 13px; color: #4a5568; line-height: 1.6;">
                <strong>📦 Packaging & Delivery:</strong> Your artwork is now being prepared with museum-grade protective packaging to ensure it reaches you in flawless condition. Our courier will deliver your package soon.
              </p>
            </div>

            <div style="margin: 24px 0; text-align: center;">
              <a href="${ordersUrl}" style="display: inline-block; background-color: #8B1D1D; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                View in Collector Registry
              </a>
            </div>
          </div>
          <div style="background-color: #faf8f5; padding: 14px 20px; border-top: 1px solid #e8e3dc; text-align: center; font-size: 11px; color: #888;">
            <p style="margin: 0;">Warm regards,<br><strong style="color: #8B1D1D;">TACHÈ Art Studio Team</strong></p>
          </div>
        </div>
      `,
    });
  }

  /**
   * Send an email to the customer when admin rejects their payment
   */
  static async sendPaymentRejectedEmail(
    to: string,
    customerName: string,
    orderId: string,
    artworkTitle: string,
    reason?: string
  ) {
    const transporter = this.getTransporter();
    const from = this.getSender();
    const orderRef = orderId.slice(-6).toUpperCase();
    const safeName = this.escapeHtml(customerName || "Customer");
    const safeTitle = this.escapeHtml(artworkTitle || "Artwork");
    const safeReason = this.escapeHtml(reason || "Payment could not be verified in our bank account");

    await transporter.sendMail({
      from,
      to,
      subject: `Payment Verification Update: #${orderRef} — TACHÈ Art Studio`,
      text: `Hello ${customerName},\n\nWe were unable to verify your payment for order #${orderRef} (${artworkTitle}).\nReason: ${reason || "Payment not verified"}\n\nIf you believe this is an error or have an updated transaction reference, please reply directly to this email.\n\nWarm regards,\nTACHÈ Art Studio Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e8e3dc; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #fdfbf7; padding: 24px; text-align: center; border-bottom: 2px solid #8B1D1D;">
            <h1 style="color: #8B1D1D; letter-spacing: 4px; margin: 0; font-size: 22px; font-weight: 700;">TACHÈ</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase;">Art Studio</p>
          </div>
          <div style="padding: 24px 28px;">
            <h2 style="color: #b91c1c; margin: 0 0 12px 0; font-size: 18px;">Payment Verification Update</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #444;">Hello ${safeName},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #444;">
              We reviewed your payment submission for order <strong>#${orderRef}</strong> (${safeTitle}), but were unable to verify the transaction in our records.
            </p>
            <div style="background-color: #fef2f2; border-left: 3px solid #dc2626; padding: 12px 14px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0; font-size: 13px; color: #991b1b;">
                <strong>Reason:</strong> ${safeReason}
              </p>
            </div>
            <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0;">
              If you have any questions, updated UTR details, or bank receipts, please reply directly to this email and our team will gladly assist you.
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
   * Send notification to admin whenever a new artwork order (UPI / cart checkout) is placed
   */
  static async sendAdminNewArtworkOrderNotification(options: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    shippingAddress?: string;
    artworkTitle: string;
    amount: number;
    utrNumber: string;
    screenshotUrl?: string;
    senderUpi?: string;
    notes?: string;
  }) {
    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      artworkTitle,
      amount,
      utrNumber,
      screenshotUrl,
      senderUpi,
      notes,
    } = options;
    const transporter = this.getTransporter();
    const adminTo = this.getAdminRecipient();
    const from = this.getSender();
    const orderRef = orderId.slice(-6).toUpperCase();

    let siteUrl = (
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "https://tacheart.vercel.app"
    ).trim().replace(/\/$/, "");

    if (siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1")) {
      siteUrl = "https://tacheart.vercel.app";
    }

    const adminPaymentsUrl = `${siteUrl}/admin/payments`;

    await transporter.sendMail({
      from,
      to: adminTo,
      replyTo: customerEmail,
      subject: `🚨 New Order #${orderRef}: ₹${amount.toLocaleString("en-IN")} from ${customerName} — TACHÈ`,
      text: `New Artwork Order Received!\n\nOrder ID: #${orderRef}\nCustomer: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone || "N/A"}\nArtwork: ${artworkTitle}\nAmount: ₹${amount.toLocaleString("en-IN")}\nUTR: ${utrNumber}\nShipping Address: ${shippingAddress || "N/A"}\nScreenshot: ${screenshotUrl || "N/A"}\n\nReview & Verify at: ${adminPaymentsUrl}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e8e3dc; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #fdfbf7; padding: 24px; text-align: center; border-bottom: 2px solid #8B1D1D;">
            <h1 style="color: #8B1D1D; letter-spacing: 4px; margin: 0; font-size: 22px; font-weight: 700;">TACHÈ</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase;">New Order & Payment Received</p>
          </div>
          <div style="padding: 24px 28px;">
            <div style="background-color: #fbf3f3; border: 1px solid #f2dede; padding: 10px 14px; border-radius: 6px; margin-bottom: 18px; text-align: center;">
              <span style="font-size: 12px; color: #8B1D1D; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Order Ref: #${orderRef} • ₹${amount.toLocaleString("en-IN")}</span>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600; width: 120px;">Customer:</td>
                <td style="padding: 6px 0; color: #111; font-weight: 700;">${this.escapeHtml(customerName)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600;">Email:</td>
                <td style="padding: 6px 0; color: #111;"><a href="mailto:${customerEmail}" style="color: #8B1D1D;">${customerEmail}</a></td>
              </tr>
              ${customerPhone ? `
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600;">Phone:</td>
                <td style="padding: 6px 0; color: #111; font-weight: 600;">${this.escapeHtml(customerPhone)}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600;">Artwork:</td>
                <td style="padding: 6px 0; color: #111; font-weight: 700;">${this.escapeHtml(artworkTitle)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600;">Amount:</td>
                <td style="padding: 6px 0; color: #047857; font-weight: 700; font-size: 15px;">₹${amount.toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600;">UTR Number:</td>
                <td style="padding: 6px 0; color: #111; font-family: monospace; font-weight: 700;">${this.escapeHtml(utrNumber)}</td>
              </tr>
              ${senderUpi ? `
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600;">Sender UPI:</td>
                <td style="padding: 6px 0; color: #111;">${this.escapeHtml(senderUpi)}</td>
              </tr>` : ""}
              ${shippingAddress ? `
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600;">Shipping Address:</td>
                <td style="padding: 6px 0; color: #111;">${this.escapeHtml(shippingAddress)}</td>
              </tr>` : ""}
              ${notes ? `
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600;">Customer Notes:</td>
                <td style="padding: 6px 0; color: #111;">${this.escapeHtml(notes)}</td>
              </tr>` : ""}
            </table>

            ${screenshotUrl ? `
            <div style="margin-top: 15px; padding: 14px; background: #fdfbf7; border: 1px solid #eae5de; border-radius: 6px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #8B1D1D; text-transform: uppercase; letter-spacing: 1px;">Attached Payment Screenshot:</p>
              <a href="${screenshotUrl}" target="_blank" style="display: inline-block; color: #8B1D1D; text-decoration: underline; font-size: 12px; font-weight: 600; margin-bottom: 8px;">View Full Screenshot</a>
              <div><img src="${screenshotUrl}" alt="Payment Receipt" style="max-width: 100%; max-height: 320px; border-radius: 6px; object-fit: contain; display: block;" /></div>
            </div>
            ` : ""}

            <div style="margin-top: 24px; text-align: center;">
              <a href="${adminPaymentsUrl}" style="display: inline-block; background-color: #8B1D1D; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                Verify & Approve in Admin Dashboard
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
   * Helper to escape HTML characters in dynamic strings
   */
  private static escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Send an account registration confirmation email to the new user with their credentials
   */
  static async sendSignupConfirmation(
    name: string,
    email: string,
    rawPassword: string
  ) {
    const transporter = this.getTransporter();
    const from = this.getSender();

    let siteUrl = (
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "https://tacheart.vercel.app"
    ).trim().replace(/\/$/, "");

    // Ensure links sent in user emails point to live production rather than localhost
    if (siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1")) {
      siteUrl = "https://tacheart.vercel.app";
    }

    const loginUrl = `${siteUrl}/login`;

    const safeName = this.escapeHtml(name);
    const safeEmail = this.escapeHtml(email);
    const safePassword = this.escapeHtml(rawPassword);

    await transporter.sendMail({
      from,
      to: email,
      subject: `Welcome to TACHÈ Art Studio — Registration Confirmation`,
      text: `Hello ${name},\n\nWelcome to TACHÈ Art Studio! Your account has been successfully created.\n\nHere are your account login details:\n• Name: ${name}\n• Email: ${email}\n• Password: ${rawPassword}\n\nYou can log in anytime at:\n${loginUrl}\n\nSecurity Notice:\nPlease keep your credentials safe and do not share them with anyone.\n\nWarm regards,\nTACHÈ Art Studio Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e8e3dc; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #fdfbf7; padding: 24px; text-align: center; border-bottom: 2px solid #8B1D1D;">
            <h1 style="color: #8B1D1D; letter-spacing: 4px; margin: 0; font-size: 22px; font-weight: 700;">TACHÈ</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase;">Art Studio</p>
          </div>
          <div style="padding: 24px 28px;">
            <h2 style="color: #8B1D1D; margin: 0 0 12px 0; font-size: 18px;">Welcome to TACHÈ, ${safeName}!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #444; margin: 0 0 18px 0;">
              Thank you for registering an account with TACHÈ Art Studio. Your profile has been created successfully.
            </p>

            <div style="background-color: #fbf9f6; border: 1px solid #e8e3dc; border-radius: 6px; padding: 18px 20px; margin-bottom: 22px;">
              <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; color: #8B1D1D; text-transform: uppercase; letter-spacing: 1px;">Your Account Credentials</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #666; font-size: 13px; width: 90px; font-weight: 600;">Name:</td>
                  <td style="padding: 6px 0; color: #111; font-size: 14px; font-weight: 600;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #666; font-size: 13px; font-weight: 600;">Email:</td>
                  <td style="padding: 6px 0; color: #111; font-size: 14px; font-weight: 600;"><a href="mailto:${safeEmail}" style="color: #8B1D1D; text-decoration: none;">${safeEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #666; font-size: 13px; font-weight: 600;">Password:</td>
                  <td style="padding: 6px 0; color: #111; font-size: 14px;"><span style="font-family: Consolas, Monaco, monospace; font-weight: 700; background-color: #f0ebe4; border: 1px solid #dfd8cf; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px;">${safePassword}</span></td>
                </tr>
              </table>
            </div>

            <div style="margin: 24px 0; text-align: center;">
              <a href="${loginUrl}" style="display: inline-block; background-color: #8B1D1D; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                Log In to Your Account
              </a>
            </div>

            <div style="background-color: #fbf9f6; border-left: 3px solid #8B1D1D; padding: 12px 14px; border-radius: 4px; margin-top: 16px;">
              <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.5;">
                <strong style="color: #333;">Security Notice:</strong> Please keep this information secure. We recommend changing your password after your initial login if you share this device.
              </p>
            </div>
          </div>
          <div style="background-color: #faf8f5; padding: 14px 20px; border-top: 1px solid #e8e3dc; text-align: center; font-size: 11px; color: #888;">
            <p style="margin: 0;">Warm regards,<br><strong style="color: #8B1D1D;">TACHÈ Art Studio Team</strong></p>
          </div>
        </div>
      `,
    });
  }

  /**
   * Send a password reset email with a 6-digit code and direct reset link
   */
  static async sendPasswordResetEmail(
    name: string,
    email: string,
    resetCode: string
  ) {
    const transporter = this.getTransporter();
    const from = this.getSender();

    let siteUrl = (
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "https://tacheart.vercel.app"
    ).trim().replace(/\/$/, "");

    if (siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1")) {
      siteUrl = "https://tacheart.vercel.app";
    }

    const resetLink = `${siteUrl}/login?mode=reset&email=${encodeURIComponent(email)}&code=${encodeURIComponent(resetCode)}`;
    const safeName = this.escapeHtml(name);

    await transporter.sendMail({
      from,
      to: email,
      subject: `Password Reset Request — TACHÈ Art Studio`,
      text: `Hello ${name},\n\nWe received a request to reset your password for your TACHÈ Art Studio account.\n\nYour 6-digit reset code is: ${resetCode}\n(This code is valid for 15 minutes)\n\nYou can also reset your password directly by visiting this link:\n${resetLink}\n\nIf you did not request a password reset, you can safely ignore this email. Your account remains secure.\n\nWarm regards,\nTACHÈ Art Studio Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e8e3dc; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #fdfbf7; padding: 24px; text-align: center; border-bottom: 2px solid #8B1D1D;">
            <h1 style="color: #8B1D1D; letter-spacing: 4px; margin: 0; font-size: 22px; font-weight: 700;">TACHÈ</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase;">Art Studio</p>
          </div>
          <div style="padding: 24px 28px;">
            <h2 style="color: #8B1D1D; margin: 0 0 12px 0; font-size: 18px;">Password Reset Request</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #444; margin: 0 0 16px 0;">
              Hello ${safeName}, we received a request to reset your password. Use the verification code below or click the button to set a new password:
            </p>

            <div style="background-color: #fbf9f6; border: 1px solid #e8e3dc; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="display: block; font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Your Verification Code</span>
              <span style="font-family: Consolas, Monaco, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #8B1D1D; display: inline-block; background-color: #ffffff; padding: 8px 20px; border-radius: 6px; border: 1px dashed #8B1D1D;">${resetCode}</span>
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #888;">Valid for 15 minutes</p>
            </div>

            <div style="margin: 24px 0; text-align: center;">
              <a href="${resetLink}" style="display: inline-block; background-color: #8B1D1D; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                Reset Password Directly
              </a>
            </div>

            <div style="background-color: #fcfcfc; border-left: 3px solid #8B1D1D; padding: 12px 14px; border-radius: 4px; margin-top: 20px;">
              <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.5;">
                <strong>Security Notice:</strong> If you did not request this password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </div>
          </div>
          <div style="background-color: #faf8f5; padding: 14px 20px; border-top: 1px solid #e8e3dc; text-align: center; font-size: 11px; color: #888;">
            <p style="margin: 0;">Warm regards,<br><strong style="color: #8B1D1D;">TACHÈ Art Studio Team</strong></p>
          </div>
        </div>
      `,
    });
  }

  /**
   * Send a password changed confirmation notification
   */
  static async sendPasswordChangedNotification(name: string, email: string) {
    const transporter = this.getTransporter();
    const from = this.getSender();
    const safeName = this.escapeHtml(name);

    await transporter.sendMail({
      from,
      to: email,
      subject: `Your TACHÈ Password Has Been Changed`,
      text: `Hello ${name},\n\nYour password for your TACHÈ Art Studio account was successfully changed.\n\nIf you did not make this change, please contact our support team immediately.\n\nWarm regards,\nTACHÈ Art Studio Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e8e3dc; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #fdfbf7; padding: 24px; text-align: center; border-bottom: 2px solid #8B1D1D;">
            <h1 style="color: #8B1D1D; letter-spacing: 4px; margin: 0; font-size: 22px; font-weight: 700;">TACHÈ</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase;">Art Studio</p>
          </div>
          <div style="padding: 24px 28px;">
            <h2 style="color: #8B1D1D; margin: 0 0 12px 0; font-size: 18px;">Password Updated Successfully</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #444; margin: 0 0 16px 0;">
              Hello ${safeName}, this is a confirmation that your TACHÈ Art Studio account password was recently changed.
            </p>
            <div style="background-color: #fbf9f6; border-left: 3px solid #8B1D1D; padding: 12px 14px; border-radius: 4px; margin-top: 16px;">
              <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.5;">
                <strong style="color: #333;">Security Notice:</strong> If you did not make this change, please reach out to us immediately to secure your account.
              </p>
            </div>
          </div>
          <div style="background-color: #faf8f5; padding: 14px 20px; border-top: 1px solid #e8e3dc; text-align: center; font-size: 11px; color: #888;">
            <p style="margin: 0;">Warm regards,<br><strong style="color: #8B1D1D;">TACHÈ Art Studio Team</strong></p>
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
