import { describe, expect, test, vi } from 'vitest';
import { POST } from './[table]';
import { sendContactConfirmationEmail, sendContactAdminNotificationEmail } from '../../../services/email';
import { apiConfig } from '../../../db/routes';
import type { APIContext } from 'astro';

vi.mock('../../../services/email', () => ({
  sendContactConfirmationEmail: vi.fn().mockResolvedValue({ id: 'email-id' }),
  sendContactAdminNotificationEmail: vi.fn().mockResolvedValue({ id: 'email-id' }),
}));

vi.mock('../../../services/data', () => ({
  insertRecord: vi.fn().mockImplementation(async (d1, kv, content) => {
    return {
      status: 201,
      data: {
        id: 'test-contact-id',
        ...content.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  })
}));

describe('Contact Form Submission', () => {
  const createMockContext = (requestData: any) => ({
    params: { table: 'contacts' },
    locals: {
      runtime: {
        env: {
          D1: {},
          KV: {},
          EMAIL_FROM: 'test@example.com',
          EMAIL_BASE_URL: 'https://example.com',
          ADMIN_EMAIL: 'admin@example.com'
        }
      }
    },
    request: {
      json: vi.fn().mockResolvedValue(requestData)
    },
    site: new URL('http://localhost'),
    generator: 'test',
    url: new URL('http://localhost/api/v1/contacts'),
    props: {},
    redirect: vi.fn(),
    cookies: {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn()
    },
    clientAddress: '127.0.0.1'
  } as unknown as APIContext);

  test('should successfully create a contact and send emails', async () => {
    const contactData = {
      data: {
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        message: 'This is a test message'
      }
    };

    const context = createMockContext(contactData);

    const response = await POST(context);
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('firstName', 'John');
    expect(result.data).toHaveProperty('lastName', 'Doe');
    expect(result.data).toHaveProperty('email', 'john.doe@example.com');
    expect(result.data).toHaveProperty('message', 'This is a test message');

    // Verify that emails were sent
    expect(sendContactConfirmationEmail).toHaveBeenCalledWith(context, result.data);
    expect(sendContactAdminNotificationEmail).toHaveBeenCalledWith(context, result.data);
  });

  test('should handle contact creation without optional fields', async () => {
    const contactData = {
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        message: 'Another test message'
      }
    };

    const context = createMockContext(contactData);

    const response = await POST(context);
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result.data).toHaveProperty('firstName', 'Jane');
    expect(result.data).toHaveProperty('lastName', 'Smith');
    expect(result.data).toHaveProperty('email', 'jane.smith@example.com');
    expect(result.data).toHaveProperty('message', 'Another test message');
    expect(result.data).not.toHaveProperty('company');
    expect(result.data).not.toHaveProperty('phone');

    // Verify that emails were still sent
    expect(sendContactConfirmationEmail).toHaveBeenCalledWith(context, result.data);
    expect(sendContactAdminNotificationEmail).toHaveBeenCalledWith(context, result.data);
  });

  test('should return 500 when data is not wrapped in data object', async () => {
    const contactData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      message: 'Test message'
    };

    const context = createMockContext(contactData);

    const response = await POST(context);
    expect(response.status).toBe(500);
  });
}); 