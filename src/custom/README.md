# Use this folder for all custom code.

- This folder is intended for any custom code that you may need to add to the project. By placing your custom code here, you can ensure that it remains separate from the core codebase.
- This separation allows you to merge the latest changes from the main branch without overwriting any of your custom modifications.
- This approach helps maintain the integrity of your custom code while keeping it up-to-date with the latest improvements and bug fixes from the main project.

# Custom Database Schema

This directory contains custom database schemas and configurations for the SonicJS application.

## Tables

### Contacts

The contacts table handles contact form submissions with automatic email notifications.

#### Features:
- **Public Access**: Anyone can submit a contact form (create operation is public)
- **Admin Only**: Only admins can read, update, or delete contact submissions
- **Email Notifications**: 
  - Confirmation email sent to the user who submitted the form
  - Notification email sent to the admin

#### Email Templates:
- `contact-confirmation.tsx`: Sent to the user with a copy of their submission
- `contact-admin-notification.tsx`: Sent to the admin with the contact details

#### Environment Variables Required:
- `EMAIL_FROM`: The email address emails are sent from
- `EMAIL_BASE_URL`: Base URL for email templates
- `ADMIN_EMAIL`: Email address for admin notifications (falls back to EMAIL_FROM if not set)
- `RESEND_API_KEY`: API key for Resend email service

#### API Endpoint:
- `POST /api/v1/contacts` - Submit a new contact form

#### Example Request:
```json
{
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "company": "Example Corp",
    "email": "john.doe@example.com",
    "phone": "123-456-7890",
    "message": "Hello, I have a question about your services."
  }
}
```

#### Hooks:
The contacts table uses the `afterOperation` hook to automatically send emails when a new contact is created. The hook:
1. Sends a confirmation email to the user
2. Sends a notification email to the admin
3. Logs success/failure for debugging

## Other Tables

- **Posts**: Blog posts and articles
- **Comments**: User comments on posts
- **Categories**: Content categories
- **CategoriesToPosts**: Many-to-many relationship between categories and posts
- **Employees**: Employee information
- **FAQs**: Frequently asked questions
- **Programs**: Program information