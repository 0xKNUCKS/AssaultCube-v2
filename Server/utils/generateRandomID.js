const crypto = require('crypto');

module.exports = (seed, len) => {
  // Create a unique seed with the timestamp
  const timestamp = Date.now().toString();

  // Use the key as an extra seed to generate a hash, honestly useless but why not.
  const hash = crypto.createHash('sha256');
  hash.update(seed + timestamp);
  const result = hash.digest('hex').slice(0, len);

  return result;
}