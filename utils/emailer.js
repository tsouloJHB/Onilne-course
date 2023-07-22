const nodemailer = require("nodemailer");


module.exports.sendEmail = async (to, message, subject) => {
    try {  
      const password = "dnmwpflioeendxiz";
      const email = "0784939@gmail.com";
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // SMTP server address (usually mail.your-domain.com)
        port: 465, // Port for SMTP (usually 465)
        secure: true, // Usually true if connecting to port 465
        auth: {
          user: email, // Your email address
          pass: password, // Password (for Gmail, your app password)
          // ⚠️ For better security, use environment variables set on the server for these values when deploying
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
  
      // Define and send message inside transporter.sendEmail() and await info about send from promise:
      let info = await transporter.sendMail({
        from: email,
        to: to,
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${subject}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                color: #003680;
              }
              .footer {
                margin-top: 50px;
                color: #003680;
              }
            </style>
          </head>
          <body>
            <h1>${subject}</h1>
            <p>${message}</p>
            <div class="footer">
              <p>at Scholar</p>
              <p>Contact Us: Scholar@example.com</p>
            </div>
          </body>
          </html>
        `,
      });
  
      console.log(info.messageId); 
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }