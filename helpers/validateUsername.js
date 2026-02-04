const validateUsername = (username) => {
  if (!username) throw new BadRequestError("Username is required");
}

module.exports = validateUsername;