"use strict";

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Queries = require("../queries/services/passwordResetQueries.js");

const db = require("../db");

const {
  BadRequestError,
  NotFoundError
} = require("../AppError");

/**
 * Optional dependency.
 * Only required when SMTP is configured.
 */
let nodemailer;

try {
  nodemailer = require("nodemailer");
} catch (err) {
  nodemailer = null;
}

const DEFAULT_TOKEN_TTL_HOURS = 1;
const BCRYPT_WORK_FACTOR = 12;


/**
 * Generate the token that will be sent to the user.
 *
 * @returns {string}
 */
function _generateToken() {
  return crypto.randomBytes(32).toString("hex");
}


/**
 * Hash token before storing it in the database.
 *
 * We do NOT store the raw reset token.
 *
 * @param {string} token
 * @returns {string}
 */
function _hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}


/**
 * Build frontend password reset URL.
 *
 * Example:
 * http://localhost:3001/reset-password?token=abc123
 *
 * @param {string} token
 * @returns {string}
 */
function _buildPasswordResetUrl(token) {
  const frontend =
    process.env.FRONTEND_URL || "http://localhost:3001";

  return (
    `${frontend.replace(/\/$/, "")}` +
    `/reset-password?token=${encodeURIComponent(token)}`
  );
}


/**
 * Creates the Nodemailer transporter.
 *
 * @returns {object|null}
 */
function _createTransporter() {
  const smtpConfigured =
    nodemailer &&
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (!smtpConfigured) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}


/**
 * Create a password reset token and send the user
 * an email containing the reset link.
 *
 * @param {string} email
 * @returns {Promise<{ok: boolean, token?: string, url?: string}>}
 */
async function createAndSendPasswordReset(email) {
  if (!email) {
    throw new BadRequestError("Email is required");
  }

  // Find account.
  const userResult = await db.query( Queries.getUserInfo(), [email] );

  if (userResult.rows.length === 0) {
    throw new NotFoundError("User with this email not found");
  }

  const user = userResult.rows[0];

  const token = _generateToken();
  const tokenHash = _hashToken(token);

  const ttlHours =
    Number(process.env.PASSWORD_RESET_TOKEN_TTL_HOURS) ||
    DEFAULT_TOKEN_TTL_HOURS;

  const expiresAt = new Date(
    Date.now() + ttlHours * 60 * 60 * 1000
  );

  /*
   * Remove previous password-reset tokens for this user.
   * Only the newest token should be valid.
   */
  await db.query(Queries.deletePasswordResetTokenByUserId(), [user.id]);

  /*
   * Store HASHED token.
   *
   * The raw token only goes into the email.
   */
  try {
    await db.query( Queries.insertPasswordResetTokenInfo(), [ user.id, tokenHash, expiresAt ] );
  } catch (err) {
    throw new BadRequestError("Failed to create password reset token");
  }

  const url = _buildPasswordResetUrl(token);

  const transporter = _createTransporter();

  /*
   * Development fallback.
   *
   * You may want to remove token/url from the return value
   * in production.
   */
  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.info("Password reset URL:", url);

      return {
        ok: false,
        message: "SMTP not configured. Password reset URL logged to console.",
      };
    }

    console.error("Password reset email service is not configured");

    return {
      ok: false,
      message: "Failed to send password reset email."
    };
  }

  const mailOptions = {
    from:
      process.env.EMAIL_FROM ||
      `no-reply@${process.env.EMAIL_DOMAIN || "example.com"}`,

    to: user.email,

    subject: "Reset your password",

    text:
      `Hello ${user.username || ""},\n\n` +
      `We received a request to reset your password.\n\n` +
      `Use the following link to reset it:\n` +
      `${url}\n\n` +
      `This link expires in ${ttlHours} hour(s).\n\n` +
      `If you did not request a password reset, you can ignore this email.`,

    html: `
      <p>Hello ${user.username || ""},</p>

      <p>
        We received a request to reset your password.
      </p>

      <p>
        <a href="${url}">
          Reset Password
        </a>
      </p>

      <p>
        This link expires in ${ttlHours} hour(s).
      </p>

      <p>
        If you did not request a password reset,
        you can ignore this email.
      </p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);

    return {
      ok: true,
      message: "Password reset email sent successfully.",
    };
  } catch (err) {
    console.error(
      "Failed to send password reset email:",
      err
    );

    return {
      ok: false,
      message: "Failed to send password reset email.",
    };
  }
}


/**
 * Validate password-reset token and update user's password.
 *
 * @param {string} token
 * @param {string} newPassword
 * @returns {Promise<{success: boolean}>}
 */
async function resetPasswordService(token, newPassword) {
  if (!token) {
    throw new BadRequestError("Token is required");
  }

  if (!newPassword) {
    throw new BadRequestError("Password is required");
  }

  if (newPassword.length < 8) {
    throw new BadRequestError(
      "Password must be at least 8 characters"
    );
  }

  /*
   * The database contains the hash, not the original token.
   */
  const tokenHash = _hashToken(token);

  const tokenResult = await db.query( Queries.getPasswordResetTokenInfo(), [tokenHash] );

  if (tokenResult.rows.length === 0) {
    throw new NotFoundError("Password reset token not found");
  }

  const resetToken = tokenResult.rows[0];

  /*
   * Check expiration.
   */
  if (new Date(resetToken.expiresAt) < new Date()) {
    await db.query( Queries.deletePasswordResetTokenById(), [resetToken.id] );

    throw new BadRequestError("Password reset token expired");
  }

  /*
   * Hash the NEW PASSWORD with bcrypt.
   *
   * This is completely separate from hashing the reset token.
   */
  const hashedPassword = await bcrypt.hash(
    newPassword,
    BCRYPT_WORK_FACTOR
  );

  try {
    await db.query("BEGIN");

    const updatedUser = await db.query(Queries.updatePassword(), [ hashedPassword, resetToken.userId ] );

    if (updatedUser.rows.length === 0) {
      await db.query("ROLLBACK");

      throw new NotFoundError("User not found");
    }

    /*
     * Delete ALL password-reset tokens belonging to the user
     * after a successful password reset.
     */
    await db.query( Queries.deletePasswordResetTokenByUserId(), [ resetToken.userId ] );

    await db.query("COMMIT");

    return {
      success: true
    };
  } catch (err) {
    await db.query("ROLLBACK");

    throw err;
  }
}


module.exports = {
  createAndSendPasswordReset,
  resetPasswordService
};