import Stripe from "stripe";
import { getRecords, updateRecord } from "./data";
import { getUserFromEmail } from "./auth";
import { return200, return500 } from "./return-types";
import { log } from "./logger";


// Stripe webhook handler
const stripeWebHookPost = async (context) => {
  log(context, {
    message: `Stripe webhook received`,
  });

  const { STRIPE_SECRET_API_KEY, STRIPE_WEBHOOK_SECRET } =
    context.locals.runtime.env;
  const stripe = new Stripe(STRIPE_SECRET_API_KEY, {
    apiVersion: "2025-05-28.basil" as const,
  });
  const signature = context.request.headers.get("stripe-signature");

  try {
    if (!signature) {
      return context.text("", 400);
    }
    // Get raw request body as text
    const body = await context.request.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "invoice.paid": {
        const invoice = event.data.object;
        log(context, {
          message: `Invoice paid - Customer: ${invoice.customer}, Amount: ${invoice.amount_paid}`,
        });
        break;
      }
      case "customer.updated": {
        const customer = event.data.object;
        const email = customer.email;
        // need to add stripe customer id to user profile
        const d1 = context.locals.runtime.env.D1;
        const user = await getUserFromEmail(d1, email);
        const profile = JSON.parse(user.profile);
        profile.stripeCustomerId = customer.id;
        if (!user) {
          log(context, {
            message: `User not found for email: ${email}`,
          });
          return;
        }
        await updateRecord(
          d1,
          {},
          {
            id: user.id,
            table: "users",
            data: {
              profile: JSON.stringify(profile),
            },
          },
          {}
        );
        log(context, {
          message: `stripe customer updated: ${customer.id}`,
          email,
        });
        break;
      }
      case "customer.subscription.created": {
        const subscription = event.data.object;
        const plan = subscription.items.data[0].plan.interval;
        const customerId = subscription.customer;

        const userRecord = await getRecords(
            context,
            "users", // table name
            {
              filters: {
                profile: {
                  $contains: customerId, // the email address you want to look up
                },
              },
            },
            `user-lookup-${customerId}`, // cache key
            "fastest"
          );


        if (!userRecord.data || !userRecord.data.length) {
          log(context, {
            message: `stripe user not found for customer id: ${customerId}`,
          });
          return;
        }

        const user = userRecord.data[0];
        log(context, {
          message: `stripe user found for customer id: ${customerId}`,
          user,
        });

        const profile = JSON.parse(user.profile);
        profile.plan = plan;

        await updateRecord(
          context.locals.runtime.env.D1,
          {},
          {
            id: user.id,
            table: "users",
            data: {
              profile: JSON.stringify(profile),
            },
          },
          {}
        );
        log(context, {
          message: `stripe new subscription created for customer: ${subscription.customer}`,
          plan: plan,
        });
        break;
      }
      default:
        log(context, { message: `stripe unhandled event type: ${event.type}` });
        break;
    }

    return return200();
  } catch (err) {
    const errorMessage = `⚠️  stripe webhook signature verification failed. ${
      err instanceof Error ? err.message : "Internal server error"
    }`;
    log(context, { message: errorMessage });
    return return500(errorMessage);
  }
};

export { stripeWebHookPost };
