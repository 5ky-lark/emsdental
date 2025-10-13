import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { withAdminAccess } from '@/lib/rbac';
import { sendEmail, emailTemplates } from '@/lib/email';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { type, recipients, data } = req.body;

      if (!type || !recipients || !data) {
        return res.status(400).json({ error: 'Type, recipients, and data are required' });
      }

      let emailSent = false;
      let template;

      switch (type) {
        case 'order_confirmation':
          template = emailTemplates.orderConfirmation(data);
          break;
        case 'order_shipped':
          template = emailTemplates.orderShipped(data, data.trackingNumber);
          break;
        case 'low_stock_alert':
          template = emailTemplates.lowStockAlert(data);
          break;
        case 'welcome_email':
          template = emailTemplates.welcomeEmail(data);
          break;
        default:
          return res.status(400).json({ error: 'Invalid notification type' });
      }

      // Send to multiple recipients if array, single recipient if string
      if (Array.isArray(recipients)) {
        const results = await Promise.allSettled(
          recipients.map(email => sendEmail(email, template.subject, template.html))
        );
        emailSent = results.some(result => result.status === 'fulfilled');
      } else {
        emailSent = await sendEmail(recipients, template.subject, template.html);
      }

      if (emailSent) {
        res.status(200).json({ message: 'Notifications sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send notifications' });
      }
    } catch (error) {
      console.error('Notification error:', error);
      res.status(500).json({ error: 'Failed to send notifications' });
    }
  } else if (req.method === 'GET') {
    // Get notification history or settings
    try {
      // This could be expanded to store notification history
      res.status(200).json({
        message: 'Notification system is active',
        availableTypes: ['order_confirmation', 'order_shipped', 'low_stock_alert', 'welcome_email'],
      });
    } catch (error) {
      console.error('Notification fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch notification data' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAdminAccess(handler);
