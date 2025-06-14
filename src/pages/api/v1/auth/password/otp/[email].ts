import { sendOTPEmail } from "@services/email";
import { return200, return404 } from "@services/return-types";
import { getRecords, updateRecord } from "@services/data";
import { formatMilliseconds } from "@services/time";
import { getUserFromEmail } from "@services/auth";

export const GET = async (context) => {
  let params = context.params;
  const emailEncoded = params.email.trim().toLowerCase();

  const email = decodeURIComponent(emailEncoded);

  const otp = generateOTPPassword(
    context.locals.runtime.env.ONE_TIME_PASSWORD_CHARACTER_LENGTH ?? 8
  );

  const user = await getUserFromEmail(context.locals.runtime.env.D1, email);

  if (!user) {
    return return404();
  }

  const now = new Date();

  const expiresOn =
    now.getTime() +
    context.locals.runtime.env.ONE_TIME_PASSWORD_EXPIRATION_TIME;
  const expirationTime = formatMilliseconds(expiresOn - now.getTime());

  const updated = await updateRecord(
    context.locals.runtime.env.D1,
    {},
    {
      table: "users",
      id: user.id,
      data: {
        passwordOTP: otp,
        passwordOTPExpiresOn: expiresOn,
      },
    },
    {}
  );

  const result = await sendOTPEmail(context, user, otp, expirationTime);

  return return200(result);
};

// declare all characters
const characters = "ABCDEFGHJKLMNPQRTUVWXY123456789";

function generateOTPPassword(length: number) {
  let result = " ";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result.trim();
}
