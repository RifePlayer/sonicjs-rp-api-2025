import {
  createSession,
  generateSessionToken,
  invalidateUserSessions,
} from "./sessions";
import { eq, like } from "drizzle-orm";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { lower, table as userTable } from "@schema/users";
import { compareStringToHash, hashString } from "./cyrpt";
import { getRecords, insertRecord, updateRecord } from "./data";
import { sendEmailConfirmationEmail } from "./email";
import { generateRandomString } from "./utils";
import { return201, return404, return500 } from "./return-types";

export const register = async (
  d1,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  otp: string,
  context: any
): Promise<object> => {
  const db = drizzle(d1);

  const lowerEmail = email?.toLowerCase();

  // Check if user already exists
  const existingUser = await getUserFromEmail(d1, lowerEmail);

  if (existingUser && existingUser.email?.length > 0) {
    return { error: "User already exists", status: 409 };
  }

  // Create new user
  const userId = crypto.randomUUID();
  const hashedPassword = await hashString(password);
  
  const newUser = {
    id: userId,
    firstName,
    lastName,
    email: lowerEmail,
    password: hashedPassword,
    role: "user",
    createdOn: Date.now(),
    updatedOn: Date.now()
  };

  const record = await insertRecord(d1, {}, {
    table: "users",
    data: newUser
  });

  // Send confirmation email if required
  // if (context.locals.runtime.env.REQUIRE_EMAIL_CONFIRMATION?.toString().toLowerCase() === "true") {
  //   const confirmationCode = generateRandomString(32);
  //   await db.update(userTable)
  //     .set({ emailConfirmationToken: confirmationCode })
  //     .where(eq(userTable.id, userId));
      
  //   await sendEmailConfirmationEmail(context, newUser, confirmationCode);
  // }

  return record;
}

export const login = async (
  d1,
  email: string,
  password: string,
  otp: string,
  context: any
): Promise<object> => {
  const db = drizzle(d1);

  const record = await db
    .select()
    .from(userTable)
    .where(like(userTable.email, email));
  const user = record[0];

  let userPassword = user?.password;
  if (!user) {
    return null;
  }

  let isPasswordCorrect = false;
  let isOTPCorrect = false;
  let error = null;

  if (password) {
    isPasswordCorrect = await compareStringToHash(
      password,
      userPassword as string
    );
    if (!isPasswordCorrect) {
      error = "Email/Password combination invalid";
      console.log("password incorrect for ", user.email);
    }
  }
  if (otp && !password) {
    isOTPCorrect = otp === user.passwordOTP;
    // Check if OTP is expired by comparing current time with OTP timestamp
    if (user.passwordOTPExpiresOn) {
      const otpExpirationTime =
        context.locals.runtime.env.ONE_TIME_PASSWORD_EXPIRATION_TIME;
      const now = Date.now();
      const otpTimestamp = new Date(user.passwordOTPExpiresOn).getTime();
      if (now - otpTimestamp > otpExpirationTime) {
        isOTPCorrect = false;
        error = "OTP Expired";
        console.log("OTP expired for", user.email);
      }
    }
    if (isOTPCorrect) {
      console.log("otp correct for ", user.email);
      // invalidate the otp so user can only use it once
      const updated = await updateRecord(
        context.locals.runtime.env.D1,
        {},
        {
          table: "users",
          id: user.id,
          data: {
            passwordOTP: null,
            passwordOTPExpiresOn: null,
          },
        },
        {}
      );
    } else {
      console.log("otp incorrect for ", user.email);
      error = "OTP Not Valid";
    }
  }

  if (isPasswordCorrect || isOTPCorrect) {
    const { token, session } = await getLoginTokenAndSession(user.id as string, context);
    return { user: cleanUser(user), bearer: token, expires: session.activeExpires };
  } else {
    console.log("login failed, password incorrect for ", user.email);
    return { error };
  }
};

export const getLoginTokenAndSession = async (userId: string, context: any) => {
  const token = generateSessionToken();
  const invalidateUserSessionsOption =
    context.locals.runtime.env.INVALIDATE_USER_SESSIONS === "true"
      ? true
      : false;
  if (invalidateUserSessionsOption) {
    // TODO: invalidate all user sessions could be async if we send session id that we don't want to invalidate
    await invalidateUserSessions(context.locals.runtime.env.D1, userId);
  }

  const session = await createSession(context.locals.runtime.env.D1, token, userId);
  return { token, session };
};

export const getUserFromEmail = async (d1, email: string) => {
  try {
    const db = drizzle(d1);

    const record = await db.select().from(userTable).where(eq(userTable.email, email.toLowerCase())); 
      
    const user = record[0];
    return user ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const doesEmailExist = async (
  d1,
  email: string
): Promise<{ exists: boolean; confirmed: boolean }> => {
  const db = drizzle(d1);

  let record;
  try {
    record = await getUserFromEmail(d1, email);
  } catch (error) {
    throw error;
  }
  const user = record;

  if (!user) {
    return { exists: false, confirmed: false };
  }
  const confirmed = user.emailConfirmedOn > 0;
  return { exists: true, confirmed };
};

export const doesAdminAccountExist = async (d1): Promise<boolean> => {
  const db = drizzle(d1);

  let record;
  try {
    record = await db
      .select()
      .from(userTable)
      .where(eq(userTable.role, "admin"));
  } catch (error) {
    console.error(
      "\x1b[31m\x1b[1m\n\n\nSonicJs Error checking for admin account. Please ensure that your database has been created, tables exist, and that your wrangler.toml (if local) or you variables are set (if on cloudflare). \n\nAlso make sure that you have run the migrations per the readme (for local) and the docs (for cloudflare) https://sonicjs.com/deploy.\n\n\n\x1b[0m",
      error
    );
    throw error;
  }
  const adminUser = record[0];

  if (!adminUser) {
    return false;
  }
  return true;
};

export const sendEmailConfirmation = async (context, email: string) => {
  const db = drizzle(context.locals.runtime.env.D1);

  const emailConfirmationToken = generateRandomString(64);

  const userRecord = await getUserFromEmail(context.locals.runtime.env.D1, email);
  if (!userRecord) {
    return { error: "User not found" };
  }
  let user = userRecord;
  //user should not exist
  if (user && user.emailConfirmedOn) {
    return { error: "User already confirmed" };
  } else if (user) {
    const updated = await updateRecord(
      context.locals.runtime.env.D1,
      {},
      {
        table: "users",
        id: user.id,
        data: {
          emailConfirmationToken: emailConfirmationToken,
        },
      },
      {}
    );

    return await sendEmailConfirmationEmail(
      context,
      user,
      emailConfirmationToken
    );
  }
};

export const confirmEmail = async (context, code: string) => {
  const db = drizzle(context.locals.runtime.env.D1); 
  const userRecord = await getRecords(context, "users", {
    filters: { emailConfirmationToken: { $eq: code } },
  });
  const user = userRecord.data[0];
  if (!user) {
    return { success: false, message: "Code not valid or already used" };
  }
  const updated = await updateRecord(
    context.locals.runtime.env.D1,
    {},
    {
      table: "users",
      id: user.id,
      data: { emailConfirmedOn: new Date().getTime(), emailConfirmationToken: null },
    },
    {}
  );
  return { success: true, message: "Email confirmed", user: cleanUser(user) };
};

export const cleanUser = (user: any) => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    profile: user.profile,
    confirmed: user.emailConfirmedOn > 0,
  };
};
