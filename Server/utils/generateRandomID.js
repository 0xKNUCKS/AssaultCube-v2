const crypto = require('crypto');

module.exports = (salt, len) => {
  // Create a unique seed with the timestamp
  const timestamp = Date.now().toString();

  // Use the user key as a salt to add additional randomness to the hash, honestly useless but why not.
  const hash = crypto.createHash('sha256');
  hash.update(salt || "" + timestamp);
  const result = hash.digest('hex').slice(0, len);

  return result;
}