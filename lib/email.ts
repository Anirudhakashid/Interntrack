// Email service placeholder - integrate with SendGrid or SMTP
export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    // Placeholder for actual email service integration
    console.log('Sending email:', { to, subject })
    console.log('HTML Content:', html)
    
    // In production, integrate with SendGrid, AWS SES, or SMTP
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // await sgMail.send({ to, from: 'noreply@yourcompany.com', subject, html })
    
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

export function generateAttendanceEmail(studentName: string, companyName: string, token: string): string {
  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/attendance/verify`
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
        .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .button { display: inline-block; padding: 12px 30px; margin: 10px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .present { background-color: #10B981; color: white; }
        .absent { background-color: #EF4444; color: white; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Internship Attendance Verification</h1>
        </div>
        <div class="content">
          <h2>Student Attendance Verification Required</h2>
          <p>Hello,</p>
          <p><strong>${studentName}</strong> from <strong>${companyName}</strong> has requested attendance verification for today.</p>
          <p>Please click one of the buttons below to verify their attendance:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}?token=${token}&status=present" class="button present">
              ✓ PRESENT
            </a>
            <a href="${verifyUrl}?token=${token}&status=absent" class="button absent">
              ✗ ABSENT
            </a>
          </div>
          <p><em>This verification link is valid for 7 days.</em></p>
        </div>
        <div class="footer">
          <p>This is an automated message from the Internship Management System</p>
        </div>
      </div>
    </body>
    </html>
  `
}