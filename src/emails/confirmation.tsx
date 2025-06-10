import {
  Button,
  Link,
  Text,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { button } from './styles';
import { paragraph } from './styles';

export const ConfirmationEmail = ( user, code, baseUrl, appUrl) => (
  <EmailLayout preview="Confirm your email address" baseUrl={baseUrl}>
    <Text style={paragraph}>
      {user.firstName ? `Hi ${user.firstName},` : ''}
    </Text>
    <Text style={paragraph}>
      Please confirm your email by clicking the link below:
    </Text>
    <Button style={button} href={`${appUrl}`}>
      Confirm Email Address
    </Button>
    <Text style={paragraph}>
      Your email will be confirmed now by clicking the link above. We take your security seriously and this link is unique to your account and can only be used once.
    </Text>
    <Text style={paragraph}>— The RifePlayer Team</Text>
  </EmailLayout>
);

export default ConfirmationEmail;
