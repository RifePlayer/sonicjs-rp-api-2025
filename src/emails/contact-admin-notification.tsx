import {
  Button,
  Link,
  Text,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { button } from './styles';
import { paragraph } from './styles';

export const ContactAdminNotificationEmail = (contact) => (
  <EmailLayout preview="New contact form submission" baseUrl={contact.baseUrl}>
    <Text style={paragraph}>
      A new contact form has been submitted on your website.
    </Text>
    <Text style={paragraph}>
      <strong>Contact Details:</strong>
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
      <strong>Submitted:</strong> {new Date().toLocaleString()}
    </Text>
    <Text style={paragraph}>
      Please respond to this inquiry as soon as possible.
    </Text>
    <Text style={paragraph}>— RifePlayer Contact System</Text>
  </EmailLayout>
);

export default ContactAdminNotificationEmail; 