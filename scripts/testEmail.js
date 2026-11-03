const fs = require('fs');
const path = require('path');
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');

envContent.split('\n').forEach(line => {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
});

const nodemailer = require('nodemailer');

const user = (process.env.EMAIL_SERVER_USER || 'aasthajainokok@gmail.com').trim();
const pass = (process.env.EMAIL_SERVER_PASSWORD || '').replace(/\s+/g, '');
const adminEmail = (process.env.ADMIN_EMAIL || user || 'aasthajainokok@gmail.com').trim();

console.log('Testing SMTP connection with:', { user, adminEmail });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass }
});

async function run() {
  try {
    // 1. Verify connection
    await transporter.verify();
    console.log('✅ SMTP Server Connection Verified!');

    // 2. Test Contact Form Email
    console.log('Sending Test Contact Email to:', adminEmail);
    const contactInfo = await transporter.sendMail({
      from: `"TACHÈ Art Studio" <${user}>`,
      to: adminEmail,
      replyTo: 'test.customer@gmail.com',
      subject: 'New Contact Form Message from Test User — TACHÈ',
      text: 'Client Name: Test User\nEmail: test.customer@gmail.com\n\nMessage: Hi Aastha, this is a test to verify contact page emails are reaching your inbox.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #8B1D1D;">New Contact Form Message — TACHÈ</h2>
          <hr style="border: 1px solid #f0f0f0;" />
          <p><strong>Client:</strong> Test User</p>
          <p><strong>Email:</strong> test.customer@gmail.com</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f9f7f5; padding: 15px; border-radius: 6px;">
            Hi Aastha, this is a test to verify contact page emails are reaching your inbox.
          </div>
        </div>
      `
    });
    console.log('✅ Contact Email sent successfully! ID:', contactInfo.messageId);

    // 3. Test Custom Order Email
    console.log('Sending Test Custom Order Email to:', adminEmail);
    const orderInfo = await transporter.sendMail({
      from: `"TACHÈ Art Studio" <${user}>`,
      to: adminEmail,
      replyTo: 'test.customer@gmail.com',
      subject: 'New Custom Order Request #TST001 from Test User — TACHÈ',
      text: 'Order #TST001\nCustomer: Test User\nArtwork: Custom Texture Canvas\nSize: 30x40 inches\nVision: Abstract textured earth tones with gold leaf.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #8B1D1D;">New Custom Order Request — TACHÈ</h2>
          <hr style="border: 1px solid #f0f0f0;" />
          <p><strong>Order ID:</strong> #TST001</p>
          <p><strong>Customer:</strong> Test User</p>
          <p><strong>Artwork Type:</strong> Custom Texture Canvas</p>
          <p><strong>Size:</strong> 30x40 inches</p>
          <p><strong>Vision:</strong> Abstract textured earth tones with gold leaf.</p>
        </div>
      `
    });
    console.log('✅ Custom Order Email sent successfully! ID:', orderInfo.messageId);

    // 4. Test Registration Confirmation Email
    console.log('Sending Test Registration Confirmation Email to:', adminEmail);
    const regInfo = await transporter.sendMail({
      from: `"TACHÈ Art Studio" <${user}>`,
      to: adminEmail,
      subject: 'Welcome to TACHÈ Art Studio — Registration Confirmation',
      text: 'Hello Test User,\n\nWelcome to TACHÈ Art Studio! Your account has been successfully created.\n\nHere are your account login details:\n• Email: test.customer@gmail.com\n• Password: SamplePassword123\n\nYou can log in anytime at:\nhttp://localhost:3000/login\n\nSecurity Notice:\nPlease keep your credentials safe and do not share them with anyone.\n\nWarm regards,\nTACHÈ Art Studio Team',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e8e3dc; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #fdfbf7; padding: 24px; text-align: center; border-bottom: 2px solid #8B1D1D;">
            <h1 style="color: #8B1D1D; letter-spacing: 4px; margin: 0; font-size: 22px; font-weight: 700;">TACHÈ</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase;">Art Studio</p>
          </div>
          <div style="padding: 24px 28px;">
            <h2 style="color: #8B1D1D; margin: 0 0 12px 0; font-size: 18px;">Welcome to TACHÈ, Test User!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #444; margin: 0 0 18px 0;">
              Thank you for registering an account with TACHÈ Art Studio. Your profile has been created successfully.
            </p>
            <div style="background-color: #fbf9f6; border: 1px solid #e8e3dc; border-radius: 6px; padding: 18px 20px; margin-bottom: 22px;">
              <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; color: #8B1D1D; text-transform: uppercase; letter-spacing: 1px;">Your Account Credentials</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #666; font-size: 13px; width: 90px; font-weight: 600;">Name:</td>
                  <td style="padding: 6px 0; color: #111; font-size: 14px; font-weight: 600;">Test User</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #666; font-size: 13px; font-weight: 600;">Email:</td>
                  <td style="padding: 6px 0; color: #111; font-size: 14px; font-weight: 600;">test.customer@gmail.com</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #666; font-size: 13px; font-weight: 600;">Password:</td>
                  <td style="padding: 6px 0; color: #111; font-size: 14px;"><span style="font-family: Consolas, Monaco, monospace; font-weight: 700; background-color: #f0ebe4; border: 1px solid #dfd8cf; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px;">SamplePassword123</span></td>
                </tr>
              </table>
            </div>
            <div style="margin: 24px 0; text-align: center;">
              <a href="http://localhost:3000/login" style="display: inline-block; background-color: #8B1D1D; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                Log In to Your Account
              </a>
            </div>
          </div>
          <div style="background-color: #faf8f5; padding: 14px 20px; border-top: 1px solid #e8e3dc; text-align: center; font-size: 11px; color: #888;">
            <p style="margin: 0;">Warm regards,<br><strong style="color: #8B1D1D;">TACHÈ Art Studio Team</strong></p>
          </div>
        </div>
      `
    });
    console.log('✅ Registration Confirmation Email sent successfully! ID:', regInfo.messageId);

  } catch (err) {
    console.error('❌ SMTP test error:', err);
  }
}

run();
