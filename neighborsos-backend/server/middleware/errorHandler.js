//Catches any error passed to next(err) and returns a clean JSON response
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'That record already exists (duplicate entry).' });
  }

  const status = err.status || 500;
  const message = err.message || 'Something went wrong on the server.';
  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
