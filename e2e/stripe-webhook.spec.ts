import { test, expect } from "@playwright/test";
import { createTestContext } from "./e2e-helpers";
import { createTestUser } from "./utils/test-user";
import { table as userTable } from "@schema/users";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

// Mock Stripe webhook event
const mockStripeEvent = {
  id: "evt_123",
  type: "customer.subscription.updated",
  data: {
    object: {
      id: "sub_123",
      customer: "cus_123",
      customer_email: "test@example.com",
      items: {
        data: [{
          id: "si_123",
          plan: {
            id: "plan_123",
            active: true,
            nickname: "Premium Plan",
          },
        }],
      },
      status: "active",
      current_period_end: Math.floor(Date.now() / 1000) + 2678400, // 31 days from now
      cancel_at_period_end: false,
    },
  },
};

// Mock Stripe webhook signature
const mockStripeSignature = "t=1686421751,v1=1234567890abcdef,v0=abcdef1234567890";

// Test context
let context;

// Mock Stripe environment variables
const mockEnv = {
  STRIPE_SECRET_API_KEY: "sk_test_123",
  STRIPE_WEBHOOK_SECRET: "whsec_123",
};

test.beforeAll(async () => {
  context = await createTestContext();
  context.locals.runtime.env = mockEnv;
});

test.afterAll(async () => {
  await context.close();
});

test("should update user profile on subscription update", async () => {
  // Create test user
  const testUser = await createTestUser(context);
  
  // Mock Stripe webhook event with test user's email
  const event = JSON.stringify(mockStripeEvent);
  const headers = {
    "stripe-signature": mockStripeSignature,
  };

  // Send webhook request
  const response = await context.request.post("/api/v1/stripe/webhook", {
    headers,
    data: event,
  });

  // Verify response
  expect(response.status()).toBe(200);

  // Verify user profile was updated
  const db = drizzle(context.locals.runtime.env.D1);
  const result = await db
    .select({
      profile: userTable.profile,
    })
    .from(userTable)
    .where(eq(userTable.id, testUser.id));

  expect(result[0].profile).toBeDefined();
  const profile = JSON.parse(result[0].profile);
  expect(profile.subscription).toBeDefined();
  expect(profile.subscription.status).toBe("active");
  expect(profile.subscription.plan).toBe("plan_123");
});

test("should handle invalid signature", async () => {
  // Send request with invalid signature
  const response = await context.request.post("/api/v1/stripe/webhook", {
    headers: {
      "stripe-signature": "invalid-signature",
    },
    data: JSON.stringify(mockStripeEvent),
  });

  // Verify response
  expect(response.status()).toBe(400);
});

test("should handle missing signature", async () => {
  // Send request without signature
  const response = await context.request.post("/api/v1/stripe/webhook", {
    data: JSON.stringify(mockStripeEvent),
  });

  // Verify response
  expect(response.status()).toBe(400);
});
