import { sqliteTable, index, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { auditSchema } from '@schema/audit';
import * as posts from './posts';
import * as users from '@schema/users';
import { isAdminOrUser } from 'db/config-helpers';
import type { ApiConfig } from 'db/routes';


export const tableName = 'programs';

export const route = 'programs';

export const definition = {
  id: text('id').primaryKey(),
  type: integer('type'),
  title: text('title'),
  slug: text('slug'),
  description: text('description'),
  descriptionAI: text('descriptionAI'),
  source: text('source'),
  frequencies: text('frequencies', { mode: 'json' }),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  sort: integer('sort').default(10),
  userId: text('userId'),
};

export const table = sqliteTable(
  tableName,
  {
    ...definition,
    ...auditSchema
  },
);

export const relation = relations(table, ({ one }) => ({
  user: one(users.table, {
    fields: [table.userId],
    references: [users.table.id]
  })
}));

export const access: ApiConfig['access'] = {
  operation: {
    read: true,
    create: isAdminOrUser,
    update: isAdminOrUser,
    delete: isAdminOrUser
  }
};

export const fields: ApiConfig['fields'] = {
  tags: {
    type: 'string[]'
  }
};
