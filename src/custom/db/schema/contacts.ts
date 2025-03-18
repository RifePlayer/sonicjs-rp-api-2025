import { sqliteTable, index, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { auditSchema } from '@schema/audit';
import { isAdmin } from 'db/config-helpers';
import type { ApiConfig } from 'db/routes';

export const tableName = 'contacts';

export const route = 'contacts';

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
