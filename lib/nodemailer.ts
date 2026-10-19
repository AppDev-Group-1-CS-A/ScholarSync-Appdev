import nodemailer from "nodemailer";

export const sendOtpEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"ScholarSync" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your ScholarSync Verification Code",
    html: `
      <div style="font-family: sans-serif; padding: 20px; background-color: #fdfcf6; border-radius: 20px; border: 1px solid #e5e7eb;">
        <h2 style="color: #212a3b; font-family: serif; font-size: 24px;">Verify your email</h2>
        <p style="color: #3d485e; font-size: 16px;">Hello! Use the following code to complete your signup at ScholarSync.</p>
        <div style="background-color: #ffffff; padding: 15px; border-radius: 10px; border: 1px solid #0000000d; display: inline-block; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #663820;">${otp}</span>
        </div>
        <p style="color: #3d485e; font-size: 14px; margin-top: 20px;">This code will expire in 10 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("--- NODEMAILER ERROR DETAIL ---");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    console.error("User:", process.env.EMAIL_USER);
    console.error("-------------------------------");
    throw new Error(`Gmail Error: ${error.message}`);
  }
};
