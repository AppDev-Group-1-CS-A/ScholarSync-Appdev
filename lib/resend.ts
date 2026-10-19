export const sendOtpEmail = async (email: string, otp: string) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    console.error("CRITICAL: RESEND_API_KEY is not set in environment variables.");
    throw new Error("Email service is not configured (missing API key)");
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ScholarSync <onboarding@resend.dev>",
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
            <hr style="border: 0; border-top: 1px solid #0000000d; margin: 20px 0;" />
            <p style="color: #3d485e; font-size: 12px; font-style: italic;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Resend API Error Detail:", JSON.stringify(errorData, null, 2));
      
      // Handle the common 'unverified domain' restriction
      if (errorData?.message?.includes("onboarding@resend.dev")) {
        throw new Error("Resend (Free Tier) only allows sending to your own email until you verify a domain.");
      }
      
      throw new Error(errorData?.message || `Email failed with status ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error("Email send network error:", err.message);
    throw err;
  }
};
