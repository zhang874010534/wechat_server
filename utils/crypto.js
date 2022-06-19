const crypto = require('crypto')

const encrypt = (algorithm, content) => {
  let hash = crypto.createHash(algorithm)
  hash.update(content)
  return hash.digest('hex')
}

const sha1 = (content) => encrypt('sha1', content)

module.exports = {
  encrypt,
  sha1
}
