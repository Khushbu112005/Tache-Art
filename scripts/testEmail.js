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

  } catch (err) {
    console.error('❌ SMTP test error:', err);
  }
}

run();
