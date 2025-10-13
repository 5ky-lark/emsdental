import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
export const emailTemplates = {
  orderConfirmation: (orderData: any) => ({
    subject: `Order Confirmation - Order #${orderData.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Order Confirmation</h2>
        <p>Dear ${orderData.customerName},</p>
        <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
        
        <h3>Order Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Order ID:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${orderData.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">₱${orderData.total.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Status:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${orderData.status}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Order Date:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(orderData.createdAt).toLocaleDateString()}</td>
          </tr>
        </table>
        
        <h3>Items Ordered:</h3>
        <ul>
          ${orderData.items?.map((item: any) => `
            <li>${item.product?.name} - Quantity: ${item.quantity} - Price: ₱${item.price.toLocaleString()}</li>
          `).join('') || 'No items found'}
        </ul>
        
        <p>We'll send you another email when your order ships.</p>
        <p>Thank you for choosing EMS Dental!</p>
        
        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          EMS Dental Equipment<br>
          Professional dental equipment and supplies
        </p>
      </div>
    `,
  }),

  orderShipped: (orderData: any, trackingNumber?: string) => ({
    subject: `Order Shipped - Order #${orderData.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Order Shipped!</h2>
        <p>Dear ${orderData.customerName},</p>
        <p>Great news! Your order has been shipped and is on its way to you.</p>
        
        <h3>Shipping Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Order ID:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${orderData.id}</td>
          </tr>
          ${trackingNumber ? `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Tracking Number:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${trackingNumber}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Shipping Address:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${orderData.customerAddress}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Estimated Delivery:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">3-5 business days</td>
          </tr>
        </table>
        
        <p>You can track your order using the tracking number above.</p>
        <p>Thank you for your business!</p>
        
        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          EMS Dental Equipment<br>
          Professional dental equipment and supplies
        </p>
      </div>
    `,
  }),

  lowStockAlert: (productData: any) => ({
    subject: `Low Stock Alert - ${productData.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Low Stock Alert</h2>
        <p>Attention: The following product is running low on stock.</p>
        
        <h3>Product Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Product Name:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${productData.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Current Stock:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; color: #dc2626; font-weight: bold;">${productData.stock} units</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Price:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">₱${productData.price.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Category:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${productData.category}</td>
          </tr>
        </table>
        
        <p style="color: #dc2626; font-weight: bold;">Please consider restocking this product soon.</p>
        
        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          EMS Dental Equipment - Inventory Management System
        </p>
      </div>
    `,
  }),

  welcomeEmail: (userData: any) => ({
    subject: `Welcome to EMS Dental!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Welcome to EMS Dental!</h2>
        <p>Dear ${userData.name},</p>
        <p>Thank you for registering with EMS Dental! We're excited to have you as our customer.</p>
        
        <h3>What's Next?</h3>
        <ul>
          <li>Browse our extensive catalog of dental equipment</li>
          <li>Add products to your cart and checkout securely</li>
          <li>Track your orders in real-time</li>
          <li>Access exclusive deals and promotions</li>
        </ul>
        
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Happy shopping!</p>
        
        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          EMS Dental Equipment<br>
          Professional dental equipment and supplies<br>
          <a href="mailto:support@emsdental.com">support@emsdental.com</a>
        </p>
      </div>
    `,
  }),
};

// Email sending functions
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email not configured, skipping send');
      return true; // Return true in development
    }

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendOrderConfirmation(orderData: any, customerEmail: string): Promise<boolean> {
  const template = emailTemplates.orderConfirmation(orderData);
  return await sendEmail(customerEmail, template.subject, template.html);
}

export async function sendOrderShipped(orderData: any, customerEmail: string, trackingNumber?: string): Promise<boolean> {
  const template = emailTemplates.orderShipped(orderData, trackingNumber);
  return await sendEmail(customerEmail, template.subject, template.html);
}

export async function sendLowStockAlert(productData: any, adminEmail: string): Promise<boolean> {
  const template = emailTemplates.lowStockAlert(productData);
  return await sendEmail(adminEmail, template.subject, template.html);
}

export async function sendWelcomeEmail(userData: any): Promise<boolean> {
  const template = emailTemplates.welcomeEmail(userData);
  return await sendEmail(userData.email, template.subject, template.html);
}

// Bulk email functions
export async function sendBulkEmail(recipients: string[], subject: string, html: string): Promise<boolean[]> {
  const results = await Promise.allSettled(
    recipients.map(email => sendEmail(email, subject, html))
  );
  
  return results.map(result => 
    result.status === 'fulfilled' ? result.value : false
  );
}
