import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import ContactEmail from '../emails/ContactEmail.jsx';
import NotificationEmail from '../emails/NotificationEmail.jsx';
import React from 'react';
import { config } from '../config/config.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.pass
  },
});

export const sendContactEmails = async ({ name, email, message }) => {
  const emailHtml = await render(React.createElement(ContactEmail, { name, message }));
  const notificationHtml = await render(React.createElement(NotificationEmail, { name, email, message }));

  // Send email to the visitor
  await transporter.sendMail({
    from: `"Jason Liu" <${config.email.user}>`,
    to: email,
    subject: 'Thanks for reaching out!',
    html: emailHtml,
  });

  // Send notification to yourself
  await transporter.sendMail({
    from: `"Portfolio Site" <${config.email.user}>`,
    to: config.email.user,
    subject: `New Message from ${name}`,
    html: notificationHtml,
  });
};
