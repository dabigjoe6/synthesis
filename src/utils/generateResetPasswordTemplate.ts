const generateResetPasswordTemplate = (resetPasswordToken: string, email: string) => {
  const RESET_PASSWORD_LINK = `${process.env.CLIENT_BASE_URL}/change-password/${email}/${resetPasswordToken}`;

  return `<div>Click on this link to reset your password <br /> <a href="${RESET_PASSWORD_LINK}">Click here</a> or copy and paste into your browser <strong>${RESET_PASSWORD_LINK}</strong></div>`;
};

export default generateResetPasswordTemplate;
