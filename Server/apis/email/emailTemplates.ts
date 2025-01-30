// utils/emailTemplates.ts
export function get2FAEmailHTML(code: string, userName: string) {
  // Split code into individual digits for better styling
  const digits = code.split("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your 2FA Code</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <tr>
          <td style="padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #F596D3, #D247BF);">
            <h1 style="margin: 0; font-size: 32px; color: white; text-transform: uppercase; letter-spacing: 2px;">Not Alone</h1>
            <p style="margin: 10px 0 0; font-size: 18px; color: white;">Security Verification</p>
          </td>
        </tr>
        
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="margin: 0 0 20px; font-size: 24px; color: #1f2937;">Welcome back, ${userName}</h2>
            
            <p style="margin: 0 0 30px; font-size: 16px; color: #6b7280; line-height: 1.6;">
              To ensure the security of your Not Alone account, please use the following verification code to complete your login:
            </p>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 30px; text-align: center; border: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 15px;">
                ${digits
                  .map(
                    (digit) => `
                  <div style="
                    display: inline-block;
                    background: white;
                    border: 2px solid #61DAFB;
                    border-radius: 8px;
                    padding: 12px;
                    min-width: 24px;
                    font-size: 24px;
                    font-weight: bold;
                    color: #03a3d7;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                  ">${digit}</div>
                `
                  )
                  .join("")}
              </div>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                This code will expire in 5 minutes
              </p>
            </div>
            
            <div style="background: rgba(97, 218, 251, 0.1); border-left: 4px solid #61DAFB; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6;">
                <strong>Security Notice:</strong> This code is valid only for the device and browser you requested it from. 
                If you didn't initiate this login attempt, please ignore this email and secure your account immediately.
              </p>
            </div>
            
            <p style="margin: 0 0 30px; font-size: 16px; color: #6b7280; line-height: 1.6;">
              At <span style="color: #D247BF; font-weight: bold;">Not Alone</span>, we're committed to protecting our community of IDF Lone Soldiers. 
              This verification step helps ensure the security of your account and our platform.
            </p>
          </td>
        </tr>
        
        <tr>
          <td style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              This is an automated security message from Not Alone. If you need assistance, our support team is here to help.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
