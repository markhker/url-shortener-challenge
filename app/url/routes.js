const router = require('express').Router();
const url = require('./url');
var path = require('path');

router.get('/', async (req, res) => {
  // route to serve up the homepage (index.html)
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

router.get('/:hash', async (req, res, next) => {

  const source = await url.getUrl(req.params.hash);

  // TODO: Respond accordingly when the hash wasn't found (404 maybe?)
  if(!source){
		let err = new Error('That hash does not exist');
		err.status = 404;
		next(err);
		return;
	}

  // TODO: Hide fields that shouldn't be public

  // Behave based on the requested format using the 'Accept' header.
  // If header is not provided or is */* redirect instead.
  const accepts = req.get('Accept');

  switch (accepts) {
    case 'text/plain':
      res.end(source.url);
      break;
    case 'application/json':
      res.json(source);
      break;
    default:
      // TODO: Register visit
      url.sumVisit(req.params.hash);
      res.redirect(source.url);
      break;
  }
});


router.post('/api/shorten', async (req, res, next) => {

  // TODO: Validate 'req.body.url' presence
  if(typeof req.body.url != "string"){
		let err = new Error('URL is a required parameter');
		err.status = 400;
		next(err);
		return;
	}

  try {
    let shortUrl = await url.shorten(req.body.url);
    res.json(shortUrl);
  } catch (err) {
    // TODO: Personalized Error Messages
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
    next(err);
  }
});


router.delete('/:hash/:removeToken', async (req, res, next) => {
  // TODO: Remove shortened URL if the remove token and the hash match
  let notImplemented = new Error('Not Implemented');
  notImplemented.status = 501;
  next(notImplemented);
});

module.exports = router;
