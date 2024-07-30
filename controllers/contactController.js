const nodemailer = require("nodemailer");
const Contact = require("../models/contact");

const sendContactForm = async (req, res) => {
  const { name, email, contactNumber, message } = req.body;

  if (!name || !email || !contactNumber || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(contactNumber)) {
    return res.status(400).json({ message: "Invalid phone number format" });
  }

  try {
    await Contact.create({ name, email, contactNumber, message });

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    let mailOptions = {
      from: email,
      to: process.env.EMAIL,
      subject: "Contact Us Form Submission",
      html: `
            <html>
            <body>
                <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #4CAF50;">Contact Us Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Contact Number:</strong> ${contactNumber}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="border-left: 2px solid #4CAF50; padding-left: 10px; margin-left: 0; color: #555;">
                    ${message}
                </blockquote>
                <p style="font-size: 0.9em; color: #777;">This message was sent via the Contact Us form on your website.</p>
                </div>
            </body>
            </html>
            `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

module.exports = {
  sendContactForm,
};
