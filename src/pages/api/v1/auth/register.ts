import { register } from "@services/auth";
import {
  return200,
  return201,
  return400,
  return409,
  return500,
} from "@services/return-types";
import type { APIRoute } from "astro";

export const OPTIONS: APIRoute = async (context) => {
  return return200();
}

export const POST: APIRoute = async (context) => {
  const contentType = context.request.headers.get("content-type");
  if (contentType === "application/json") {
    // Get the body of the request
    const body: { email: string; password: string; firstName: string; lastName: string } = await context.request.json();
    const { email, password, firstName, lastName } = body?.data;

    const registerResult = await register(
      context.locals.runtime.env.D1,
      firstName,
      lastName,
      email,
      password,
      null,
      context
    );

    if (registerResult.error && registerResult.status === 409) {
      return return409("Conflict: User already exists");
    } else {
      return return201(registerResult);
    }
  }

  return return500("Error: Content-Type must be application/json");
};
