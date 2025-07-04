import { sqliteTable, index, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { auditSchema } from '@schema/audit';
import { isAdmin } from 'db/config-helpers';
import type { ApiConfig } from 'db/routes';
import { sendContactConfirmationEmail, sendContactAdminNotificationEmail } from '@services/email';

export const tableName = 'contacts';

export const route = 'contacts';
export const name = "Contacts";
export const icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>`;

export const definition = {
  id: text('id').primaryKey(),
  firstName: text('firstName'),
  lastName: text('lastName'),
  company: text('company'),
  email: text('email'),
  phone: text('phone'),
  message: text('message')
};

export const table = sqliteTable(tableName, {
  ...definition,
  ...auditSchema
});

export const access: ApiConfig['access'] = {
  operation: {
    read: isAdmin,
    create: true,
    update: isAdmin,
    delete: isAdmin
  }
};

export const fields: ApiConfig['fields'] = {
  message: {
    type: 'ckeditor'
  }
};

export const hooks: ApiConfig['hooks'] = {
  afterOperation: async (context, operation, id, data, result) => {
    if (operation === 'create' && result?.data) {
      const contact = result.data;
      
      try {
        // Send confirmation email to the user
        await sendContactConfirmationEmail(context, contact);
        console.log('Contact confirmation email sent to:', contact.email);
      } catch (error) {
        console.error('Failed to send contact confirmation email:', error);
      }
      
      try {
        // Send notification email to admin
        await sendContactAdminNotificationEmail(context, contact);
        console.log('Contact admin notification email sent');
      } catch (error) {
        console.error('Failed to send contact admin notification email:', error);
      }
    }
  }
};
