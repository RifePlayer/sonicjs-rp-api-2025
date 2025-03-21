import { sqliteTable, index, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { auditSchema } from '@schema/audit';
import * as posts from './posts';
import * as users from '@schema/users';
import { isAdminOrUser } from 'db/config-helpers';
import type { ApiConfig } from 'db/routes';


export const tableName = 'programs';

export const route = 'programs';
export const name = "Programs";
export const icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>`;

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
