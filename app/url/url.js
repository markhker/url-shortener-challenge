const uuidv4 = require('uuid/v4');
const { domain } = require('../../environment');
const SERVER = `${domain.protocol}://${domain.host}`;

const UrlModel = require('./schema');
const parseUrl = require('url').parse;
const validUrl = require('valid-url');
const shortid = require("shortid");

/**
 * Lookup for existant, active shortened URLs by hash.
 * 'null' will be returned when no matches were found.
 * @param {string} hash
 * @returns {object}
 */
async function getUrl(hash) {
  let source = await UrlModel.findOne({ active: true, hash });
  return source;
}


/**
 * Generate a random token that will allow URLs to be (logical) removed
 * @returns {string} uuid v4
 */
function generateRemoveToken() {
  return uuidv4();
}

/**
 * Create an instance of a shortened URL in the DB.
 * Parse the URL destructuring into base components (Protocol, Host, Path).
 * An Error will be thrown if the URL is not valid or saving fails.
 * @param {string} url
 * @returns {object}
 */
async function shorten(url) {
  const hash = shortid.generate();

  if (!isValid(url)) {
    throw new Error('Invalid URL' + url);
  }

  try {
    const item = await UrlModel.findOne({url})
    if(item){
      return {
        url: item.url,
        shorten: `${SERVER}/${item.hash}`,
        hash: item.hash,
        removeUrl: `${SERVER}/${item.hash}/remove/${item.removeToken}`
      };
    } else {
      // Get URL components for metrics sake
      const urlComponents = parseUrl(url);
      const protocol = urlComponents.protocol || '';
      const domain = `${urlComponents.host || ''}${urlComponents.auth || ''}`;
      const path = `${urlComponents.path || ''}${urlComponents.hash || ''}`;

      // Generate a token that will alow an URL to be removed (logical)
      const removeToken = generateRemoveToken();

      // Create a new model instance
      const shortUrl = new UrlModel({
        url,
        protocol,
        domain,
        path,
        hash,
        isCustom: false,
        removeToken,
        active: true
      });

      // TODO: Handle save errors
      const saved = await shortUrl.save(err => {
        if(err) {
          throw new Error('Data not saved');
        }
      });

      return {
        url,
        shorten: `${SERVER}/${hash}`,
        hash,
        removeUrl: `${SERVER}/${hash}/remove/${removeToken}`
      };
    }
  } catch (err) {
    throw new Error('Invalid URL' + url);
  }
}

/**
 * Validate URI
 * @param {any} url
 * @returns {boolean}
 */
function isValid(url) {
  return validUrl.isUri(url);
}

/**
 * Log visits
 * @param {string} hash
 * @returns {object}
 */
async function sumVisit (hash) {
  return await UrlModel.findOneAndUpdate(
    { hash },
    { $inc: { visits: 1 } }
  );
}

module.exports = {
  shorten,
  getUrl,
  generateRemoveToken,
  isValid,
  sumVisit
}
