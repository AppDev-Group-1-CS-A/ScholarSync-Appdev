export const sendOtpEmail = async (email: string, otp: string) => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.error("CRITICAL: EmailJS environment variables are missing.");
    throw new Error("Email service configuration incomplete.");
  }

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: {
          to_email: email,
          otp_code: otp,
          reply_to: "no-reply@scholarsync.com",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("--- EmailJS API ERROR ---");
      console.error("Status:", response.status);
      console.error("Response:", errorText);
      console.error("-------------------------");
      throw new Error(`EmailJS failed: ${errorText}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error("EmailJS Network Error:", err.message);
    throw err;
  }
};
