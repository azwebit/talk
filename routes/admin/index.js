const express = require('express');
const router = express.Router();
const {
  RECAPTCHA_PUBLIC,
  WEBSOCKET_LIVE_URI,
} = require('../../config');

// Get /email-confirmation expects a signed JWT in the hash
router.get('/confirm-email', (req, res) => {
  res.render('admin/confirm-email');
});

// Get /password-reset expects a signed token (JWT) in the hash.
// Links to this endpoint are generated by /views/password-reset-email.ejs.
router.get('/password-reset', (req, res) => {

  // TODO: store the redirect uri in the token or something fancy.
  // admins and regular users should probably be redirected to different places.
  res.render('admin/password-reset');
});

router.get('*', (req, res) => {
  const data = {
    TALK_RECAPTCHA_PUBLIC: RECAPTCHA_PUBLIC,
    LIVE_URI: WEBSOCKET_LIVE_URI,
  };

  res.render('admin', {data});
});

module.exports = router;
