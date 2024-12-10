export const paymentSuccessTemplate = (paymentDetails: {
  name: string;
  email: string;
  amount: string;
  paymentMethod: string;
  date: string;
  teamName: string;
  teamId: string;
  eventName: string;
}) => {
  const year = new Date().getFullYear();

  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful</title>
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
            border-top: 5px solid #2ecc71;
        }
        .header {
            margin-bottom: 30px;
        }
        .header img {
            max-width: 200px;
        }
        h1 {
            color: #2c3e50;
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 20px;
            line-height: 1.2;
        }
        p {
            font-size: 16px;
            color: gray;
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
        .table-container {
            max-height: 200px; 
            overflow: auto; 
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background-color: #f7fafc;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 1rem;
            text-align: left;
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
        }
        th {
            background-color: #f7fafc;
            color: #4a5568;
        }
        .cta-button {
            background-color: #2ecc71;
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
            background-color: #27ae60;
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
   
        <h1>Payment Successful</h1>
        <p style="text-align: start; font-weight: 700">Dear ${paymentDetails.name},</p>
        <p style="text-align: start">We are pleased to inform you that your payment has been successfully processed. Thank you for your payment. Below are the details of your completed transaction:</p>
     
        <div class="payment-details">
            <h3>Team Information</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Team Name</th>
                            <th>Team ID</th>
                            <th>Event</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${paymentDetails.teamName}</td>
                            <td>${paymentDetails.teamId}</td>
                            <td>${paymentDetails.eventName}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="payment-details">
            <h3>Payment Information</h3>
            <p><strong>Name:</strong> ${paymentDetails.name}</p>
            <p><strong>Email:</strong> ${paymentDetails.email}</p>
            <p><strong>Amount:</strong> $${paymentDetails.amount}</p>
            <p><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</p>
            <p><strong>Date of Payment:</strong> ${paymentDetails.date}</p>
        </div>

        <p>We appreciate your prompt payment and your continued trust in us. If you have any questions or require further assistance, feel free to contact us.</p>

        <footer>
          <span style="color: gray"> &copy; ${year} Dulles United Association. All rights reserved.</span> <br />
            <a href="#">Contact Us</a>
        </footer>
    </div>
</body>
</html>


      `;
};
