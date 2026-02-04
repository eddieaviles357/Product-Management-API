function insertUser() {
  return `INSERT INTO users (first_name, last_name, username, password, email, is_admin)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING 
            id, first_name AS "firstName", last_name AS "lastName", username, email, is_admin AS "isAdmin"`;
}

function getUser() {
  return `SELECT
            id, 
            first_name AS "firstName", 
            last_name AS "lastName", 
            username, 
            password,
            email,
            is_admin as "isAdmin",
            join_at AS "joinAt"
          FROM users
          WHERE username = $1`;
};

function updateUserLoginTimeStamp() {
  return `UPDATE users 
          SET last_login_at = NOW() 
          WHERE username = $1 
          RETURNING last_login_at AS "lastLoginAt"`;
};

module.exports = {
  insertUser,
  getUser,
  updateUserLoginTimeStamp
};