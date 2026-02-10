"use strict";

const crypto = require("crypto");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../AppError");

// Optional dependency; only required when SMTP is configured
let nodemailer;
try { 
  nodemailer = require("nodemailer"); 
} catch (e) { 
  nodemailer = null; 
}

const DEFAULT_TOKEN_TTL_HOURS = 24;

function _generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function _buildVerificationUrl(token) {
  const frontend = process.env.FRONTEND_URL || `http://localhost:3001`;
  return `${frontend.replace(/\/$/, "")}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`;
}

/**
 * @typedef {Object} userObject
 * @property {string} email
 * @property {string} username
 */

/**
 * Create a verification token record for an email and optionally send an email.
 * @param {userObject} user
 * @returns {object} boolean, token, url
 */
async function createAndSendVerification(user) {
  if (!user || !user.email) {
    throw new BadRequestError("User email is required");
  }

  const token = _generateToken();
  const ttlHours = Number(process.env.EMAIL_TOKEN_TTL_HOURS) || DEFAULT_TOKEN_TTL_HOURS;
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  // store token in DB
  try {
    await db.query(`INSERT INTO email_verification_tokens (email, token, expires_at) 
                   VALUES ($1, $2, $3) 
                   RETURNING id`, [user.email, token, expiresAt]);
  } catch (err) {
    throw new BadRequestError("Failed to create verification token");
  }

  const url = _buildVerificationUrl(token);

  // If SMTP configured and nodemailer available, try to send
  const smtpConfigured = nodemailer && process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (smtpConfigured) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || `no-reply@${process.env.EMAIL_DOMAIN || "example.com"}`,
      to: user.email,
      subject: "Verify your email",
      text: `Hello ${user.username || ''}\n\nPlease verify your email by visiting the following link:\n${url}\n\nThis link expires in ${ttlHours} hours.`,
      html: `<p>Hello ${user.username || ''},</p><p>Please verify your email by clicking the link below:</p><p><a href="${url}">Verify Email</a></p><p>This link expires in ${ttlHours} hours.</p>`
    };

    try {
      await transporter.sendMail(mailOptions);
      return { ok: true, token, url };
    } catch (err) {
      console.error("Failed to send verification email:", err);
      return { ok: false, token, url };
    }
  }

  // Fallback: log URL for developer
  console.info("Verification URL:", url);
  return { ok: false, token, url };
}

/**
 * Verify a token, mark user's email_verified_at, and remove token record.
 * @param {string} token
 * @returns {Promise<{email:string, verifiedAt:Date}>}
 */
async function verifyTokenAndActivate(token) {
  if (!token) {
    throw new BadRequestError("Token is required");
  }

  const res = await db.query(`SELECT email, expires_at FROM email_verification_tokens 
                              WHERE token = $1`, [token]);

  if (res.rows.length === 0) {
    throw new NotFoundError("Verification token not found");
  }

  const { email, expires_at: expiresAt } = res.rows[0];

  if (new Date(expiresAt) < new Date()) {
    // token expired - delete it
    await db.query(`DELETE FROM email_verification_tokens 
                    WHERE token = $1`, [token]);
    throw new BadRequestError("Verification token expired");
  }

  // Use transaction to update user and delete token
  try {
    await db.query("BEGIN");

    const updated = await db.query(`
      UPDATE users 
      SET email_verified_at = NOW() 
      WHERE email = $1 
      RETURNING 
        id, username, email, email_verified_at`, [email]);

    if (updated.rows.length === 0) {
      await db.query("ROLLBACK");
      throw new NotFoundError("User with this email not found");
    }

    await db.query(`DELETE FROM email_verification_tokens 
                    WHERE token = $1`, [token]);

    await db.query("COMMIT");

    const user = updated.rows[0];
    
    return { 
      email: user.email, 
      verifiedAt: user.email_verified_at 
    };
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}

module.exports = {
  createAndSendVerification,
  verifyTokenAndActivate,
};
