export const newPaymentRequestTemplate = (paymentDetails: {
  name: string;
  email: string;
  amount: string;
  transactionId: string;
  date: string;
  companyLogoUrl: string;
  paymentLink: string;
}) => {
  const year = new Date().getFullYear();

  return `
   <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Payment Request</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #f4f7fa;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 700px;
                margin: auto;
                background: #ffffff;
                padding: 40px;
                border-radius: 15px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                text-align: center;
                margin-top: 40px;
                border-top: 5px solid #3498db;
            }
            .header {
                margin-bottom: 30px;
            }
            .header img {
                max-width: 200px;
            }
            h1 {
                color: #34495e;
                font-size: 36px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 20px;
                line-height: 1.2;
            }
            p {
                font-size: 16px;
                color: #7f8c8d;
                margin-bottom: 20px;
                line-height: 1.5;
            }
            .payment-details {
                background-color: #ecf0f1;
                padding: 25px;
                border-radius: 10px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                margin-bottom: 30px;
                text-align: left;
            }
            .payment-details h3 {
                color: #2c3e50;
                font-size: 22px;
                margin-bottom: 15px;
                font-weight: 600;
            }
            .payment-details p {
                font-size: 14px;
                color: #34495e;
                margin: 10px 0;
            }
            .cta-button {
                background-color: #3498db;
                color: white;
                padding: 14px 30px;
                font-size: 16px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                text-decoration: none;
                font-weight: bold;
                text-transform: uppercase;
                transition: background-color 0.3s ease;
                display: inline-block;
                margin-top: 20px;
            }
            .cta-button:hover {
                background-color: #2980b9;
            }
            footer {
                margin-top: 50px;
                font-size: 14px;
                color: #bdc3c7;
                text-align: center;
                line-height: 1.5;
            }
            footer a {
                color: #3498db;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://res.cloudinary.com/dqke2ei62/image/upload/v1733719546/v03suprii1e0chuongyn.png" alt="Company Logo" />
            </div>
  
            <h1>Event Registration</h1>
          <div style="display: flex; justify-content: end; align-items: center; gap: 4px; font-size: 14px">
            <span>Payment: </span> <span style="padding: 4px 10px; background: green; color: white; font-weight: bold; border-radius: 5px">Success</span>
          </div>
            <p style="text-align: left">Dear Admin,</p>
            <p style="text-align: left">You have received a new payment request. Below are the details of the payment for your review and approval:</p>
  
            <div class="payment-details">
                <h3>Payment Information</h3>
                <p><strong>Name:</strong> ${paymentDetails.name}</p>
                <p><strong>Email:</strong> ${paymentDetails.email}</p>
                <p><strong>Amount:</strong> $${paymentDetails.amount}</p>
                <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
                <p><strong>Date of Payment:</strong> ${paymentDetails.date}</p>
            </div>
  
            <p>Once you have reviewed the payment information, please click the button below to approve the payment:</p>
  
            <a href="${paymentDetails.paymentLink}" class="cta-button">Approve Payment</a>
  
            <footer>
              <span style="color: gray">&copy; ${year} Dulles United Association. All rights reserved.</span> <br />
                <a href="#">Privacy Policy</a> | <a href="#">Terms & Conditions</a>
            </footer>
        </div>
    </body>
    </html>

    `;
};
