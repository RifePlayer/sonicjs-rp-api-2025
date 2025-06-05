import { confirmEmail, doesEmailExist, getLoginTokenAndSession, login, sendEmailConfirmation } from "@services/auth";
import { return200, return404, return500 } from "@services/return-types";

export async function GET(context) {
  const code = context.params.code;
  const result = await confirmEmail(context, code);
  if (!result.success) {
    return return404(result.message );
  }

  const redirectUrl = context.locals.runtime.env.EMAIL_CONFIRMATION_REDIRECT_URL;

  if(redirectUrl){
    return context.redirect(redirectUrl);

  }

  const autoLogin = context.locals.runtime.env.AUTO_LOGIN_AFTER_EMAIL_CONFIRMATION;

  if(autoLogin){
    const loginResult = await getLoginTokenAndSession(result.user.id, context);
    return return200({ message: "Email confirmed", user: result.user, token: loginResult.token, expires: loginResult.session.activeExpires });
  }

  return return200({ message: "Email confirmed" });
}