const nodemailer = require('nodemailer');
const config = require('../config');
const prisma = require('../config/prisma');

class NotificationService {
  static transporter = null;

  static getTransporter() {
    if (!this.transporter) {
      if (config.smtp.user && config.smtp.password) {
        this.transporter = nodemailer.createTransporter({
          host: config.smtp.host,
          port: config.smtp.port,
          secure: config.smtp.port === 465,
          auth: {
            user: config.smtp.user,
            pass: config.smtp.password
          }
        });
      } else {
        // Mock transporter for development / testing
        this.transporter = {
          sendMail: async (mailOptions) => {
            console.log('\n[MOCK EMAIL SENT]');
            console.log(`To: ${mailOptions.to}`);
            console.log(`Subject: ${mailOptions.subject}`);
            console.log(`Body: ${mailOptions.text || mailOptions.html}`);
            console.log('--------------------------------------------------\n');
            return { messageId: `mock-${Date.now()}` };
          }
        };
      }
    }
    return this.transporter;
  }

  static async notify({
    userId,
    title,
    message,
    type = 'info',
    metadata = null,
    email = null,
    sendEmail = false
  }) {
    try {
      // 1. Create in-app notification
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          metadata: metadata ? JSON.stringify(metadata) : null
        }
      });

      // 2. Send email if requested or if email is provided
      if (sendEmail && email) {
        const transporter = this.getTransporter();
        await transporter.sendMail({
          from: `"AMS+ University Portal" <${config.smtp.fromEmail}>`,
          to: email,
          subject: `AMS+ Notification: ${title}`,
          text: message,
          html: `<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
            <h2 style="color: #1e3a8a;">AMS+ Notification</h2>
            <h3>${title}</h3>
            <p>${message}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #64748b; font-size: 12px;">This is an automated notification from AMS+ Alumni Management & Engagement System.</p>
          </div>`
        });
      }

      return notification;
    } catch (error) {
      console.error('Notification error:', error);
      return null;
    }
  }
}

module.exports = NotificationService;
