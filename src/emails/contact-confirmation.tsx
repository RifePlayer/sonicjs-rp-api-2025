import {
  Button,
  Link,
  Text,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { button } from './styles';
import { paragraph } from './styles';

export const ContactConfirmationEmail = (contact) => (
  <EmailLayout preview="Thank you for contacting us" baseUrl={contact.baseUrl}>
    <Text style={paragraph}>
      {contact.firstName ? `Hi ${contact.firstName},` : 'Hi there,'}
    </Text>
    <Text style={paragraph}>
      Thank you for reaching out to us! We have received your message and will get back to you as soon as possible.
    </Text>
    <Text style={paragraph}>
      Here's a copy of your message for your records:
    </Text>
    <Text style={paragraph}>
      <strong>Name:</strong> {contact.firstName} {contact.lastName}
    </Text>
    {contact.company && (
      <Text style={paragraph}>
        <strong>Company:</strong> {contact.company}
      </Text>
    )}
    <Text style={paragraph}>
      <strong>Email:</strong> {contact.email}
    </Text>
    {contact.phone && (
      <Text style={paragraph}>
        <strong>Phone:</strong> {contact.phone}
      </Text>
    )}
    <Text style={paragraph}>
      <strong>Message:</strong>
    </Text>
    <Text style={paragraph}>
      {contact.message}
    </Text>
    <Text style={paragraph}>
      We typically respond within 24-48 hours during business days. If you have any urgent questions, please don't hesitate to reach out again.
    </Text>
    <Text style={paragraph}>— The RifePlayer Team</Text>
  </EmailLayout>
);

export default ContactConfirmationEmail; 