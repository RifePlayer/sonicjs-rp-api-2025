import { stripeWebHookPost } from "@services/stripe";

export const POST = async (context) => {
  return stripeWebHookPost(context);
};
