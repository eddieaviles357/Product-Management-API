function getUserInfo() {
  return `
    SELECT
      id,
      username,
      email
    FROM users
    WHERE email = $1
    `;
}
function getPasswordResetTokenInfo() {
  return `
    SELECT
      id,
      user_id AS "userId",
      expires_at AS "expiresAt"
    FROM password_reset_tokens
    WHERE token_hash = $1
    `;
}

function deletePasswordResetTokenById() {
  return `
    DELETE FROM password_reset_tokens
    WHERE id = $1
    `;
}

function deletePasswordResetTokenByUserId() {
  return `
    DELETE FROM password_reset_tokens
    WHERE user_id = $1
    `;
}

function insertPasswordResetTokenInfo() {
  return `
    INSERT INTO password_reset_tokens (
      user_id,
      token_hash,
      expires_at
    )
    VALUES ($1, $2, $3)
  `;
}

function updatePassword() {
  return `
    UPDATE users
    SET password = $1
    WHERE id = $2
    RETURNING
      id,
      username,
      email
  `;
}


module.exports = {
  getPasswordResetTokenInfo,
  deletePasswordResetTokenById,
  deletePasswordResetTokenByUserId,
  insertPasswordResetTokenInfo,
  updatePassword,
  getUserInfo
}