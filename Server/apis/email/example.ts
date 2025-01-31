// import nodemailer from "nodemailer";
// import crypto from "crypto";
// import verificationModel from "../../src/models/verificationModel";

// export async function generateVerificationCode(
//   email: string,
//   isLogin: boolean
// ): Promise<void> {
//   try {
//     const verificationCode = crypto
//       .randomBytes(3)
//       .toString("hex")
//       .replace(/[a-z]/g, (match) => match.toUpperCase()); // 6-character hex code

//     const expiresAt = new Date();
//     expiresAt.setMinutes(expiresAt.getMinutes() + 5);

//     // Check if the user already has a document
//     let verificationRecord = await verificationModel.findOne({ email });

//     if (verificationRecord) {
//       // Update existing record if it exists
//       verificationRecord.verificationCode = verificationCode;
//       verificationRecord.expiresAt = expiresAt;
//     } else {
//       // Create a new verification record
//       verificationRecord = new verificationModel({
//         email,
//         verificationCode,
//         expiresAt,
//       });
//     }

//     await verificationRecord.save();

//     // Send the verification code to the user's email using Nodemailer
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "bookingcloner@gmail.com",
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     });

//     const mailOptions = {
//       from: "bookingcloner@gmail.com",
//       to: email,
//       subject: `Booking.com – This is your verification code: ${verificationCode}`,
//       html: `
//         <html>
//         <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f0f0;">
//             <header style="background-color: #003a63; color: white; padding: 15px 5px;">
//                 <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//                     <tr>
//                         <td align="left" style="padding-left: 15px;">
//                             <h2 style="margin: 0; font-size: 24px;">Booking.com</h2>
//                         </td>
//                         <td align="right" style="padding-right: 15px;">
//                             <span style="font-size: 16px"><a href="${email}" style="color: #ffffff;">${email}</a></span>
//                         </td>
//                     </tr>
//                 </table>
//             </header>
//             <div style="background-color: white; border-radius: 8px; box-shadow: 0px 0px 15px rgba(0,0,0,0.1); margin-top: 30px; padding: 30px;">
//             <h3 style="color: #003a63; font-size: 20px;">Email Verification and Account ${
//               isLogin ? "Login" : "Sign Up"
//             }</h3>
//             <p style="font-size: 16px; color: #333;">Hello,<br><br>This is your unique verification code for ${
//               isLogin ? "logging in" : "signing up"
//             } to Booking.com. Please enter it within the next 5 minutes.</p>
//             <h2 style="font-size: 32px;  text-align: center; color: #003a63; font-weight: bold; letter-spacing: 2px;">${verificationCode}</h2> <!-- Replace with generated verification code -->
//             <p style="font-size: 14px; color: #333;">Please note, this code is valid for only one use. If you did not request this code, you can ignore this message.</p>
//             <p style="font-size: 14px; color: #333;">If you have any issues, please contact <a href="mailto:bookingcloner@gmail.com" style="color: #003a63;">bookingcloner@gmail.com</a>.</p>
//             </div>
//             <div style="text-align: center; margin-top: 20px; color: #777;">
//             <p style="font-size: 12px;">©️ Booking.com 2025. All rights reserved.</p>
//             </div>
//         </body>
//         </html>
//         `,
//     };

//     // Send the email
//     await transporter.sendMail(mailOptions);
//     // console.log(Verification code sent to ${email});
//   } catch (error) {
//     console.error("Error generating verification code:", error);
//     throw new Error("Failed to generate verification code");
//   }
// }
