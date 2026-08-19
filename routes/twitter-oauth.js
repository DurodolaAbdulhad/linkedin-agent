import express from 'express';
import axios from 'axios';
import crypto from 'crypto';

const router = express.Router();

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || process.env.TWITTER_API_KEY;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || process.env.TWITTER_API_SECRET;
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const REDIRECT_URI = 'https://agent.durodola.africa/api/twitter/callback';

// Store tokens in memory (replace with database in production)
const tokenStore = {};

// Step 1: Generate OAuth state and code verifier (PKCE)
router.get('/authorize', (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // Store for verification
  tokenStore.twitterState = state;
  tokenStore.twitterCodeVerifier = codeVerifier;

  const authUrl =
    `https://twitter.com/i/oauth2/authorize?` +
    `response_type=code&client_id=${TWITTER_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=tweet.read%20tweet.write%20users.read%20follows.read%20follows.write%20mute.read%20mute.write%20offline.access&` +
    `state=${state}&` +
    `code_challenge=${codeChallenge}&` +
    `code_challenge_method=S256`;

  res.redirect(authUrl);
});

// Step 2: Handle callback, exchange code for access token
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  // Verify state
  if (state !== tokenStore.twitterState) {
    return res.status(401).json({ error: 'State mismatch - security validation failed' });
  }

  if (error) {
    return res.status(400).json({ error: error, error_description: req.query.error_description });
  }

  if (!code) {
    return res.status(400).json({ error: 'No authorization code received' });
  }

  try {
    // Exchange code for access token (Twitter OAuth 2.0)
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('code_verifier', tokenStore.twitterCodeVerifier);
    params.append('client_id', TWITTER_CLIENT_ID);

    const tokenResponse = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      params,
      {
        auth: {
          username: TWITTER_CLIENT_ID,
          password: TWITTER_CLIENT_SECRET
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Store tokens
    tokenStore.twitterAccessToken = access_token;
    tokenStore.twitterRefreshToken = refresh_token;
    tokenStore.twitterExpiresAt = Date.now() + (expires_in * 1000);

    console.log('✓ Twitter OAuth Success');
    console.log('✓ Access Token:', access_token.substring(0, 20) + '...');
    console.log('✓ Expires in:', expires_in, 'seconds');
    console.log('✓ Refresh Token available:', !!refresh_token);

    res.json({
      success: true,
      message: 'Twitter OAuth successful!',
      accessToken: access_token,
      refreshToken: refresh_token ? '(stored)' : null,
      expiresIn: expires_in,
      expiresAt: new Date(tokenStore.twitterExpiresAt).toISOString(),
      instruction: 'Token stored in Render environment. Ready for DM operations.'
    });
  } catch (error) {
    console.error('❌ Twitter OAuth Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'OAuth token exchange failed',
      details: error.response?.data || error.message
    });
  }
});

// Refresh access token using refresh token
router.post('/refresh', async (req, res) => {
  if (!tokenStore.twitterRefreshToken) {
    return res.status(400).json({ error: 'No refresh token available' });
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', tokenStore.twitterRefreshToken);
    params.append('client_id', TWITTER_CLIENT_ID);

    const tokenResponse = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      params,
      {
        auth: {
          username: TWITTER_CLIENT_ID,
          password: TWITTER_CLIENT_SECRET
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const { access_token, expires_in } = tokenResponse.data;

    tokenStore.twitterAccessToken = access_token;
    tokenStore.twitterExpiresAt = Date.now() + (expires_in * 1000);

    res.json({
      success: true,
      message: 'Token refreshed',
      accessToken: access_token,
      expiresAt: new Date(tokenStore.twitterExpiresAt).toISOString()
    });
  } catch (error) {
    console.error('❌ Twitter Token Refresh Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Token refresh failed',
      details: error.response?.data || error.message
    });
  }
});

// Get current Twitter token (for testing)
router.get('/token', (req, res) => {
  if (!tokenStore.twitterAccessToken) {
    return res.status(404).json({ error: 'No Twitter token stored' });
  }

  res.json({
    accessToken: tokenStore.twitterAccessToken.substring(0, 20) + '...',
    expiresAt: new Date(tokenStore.twitterExpiresAt).toISOString(),
    isExpired: Date.now() > tokenStore.twitterExpiresAt,
    hasRefreshToken: !!tokenStore.twitterRefreshToken
  });
});

// Test endpoint to verify OAuth is working
router.get('/status', (req, res) => {
  const hasToken = !!tokenStore.twitterAccessToken;
  const isExpired = hasToken && Date.now() > tokenStore.twitterExpiresAt;

  res.json({
    configured: !!TWITTER_CLIENT_ID && !!TWITTER_CLIENT_SECRET,
    tokenStored: hasToken,
    isExpired: isExpired,
    redirectUri: REDIRECT_URI,
    message: !hasToken
      ? 'Click /api/twitter/authorize to start OAuth flow'
      : isExpired
      ? 'Token expired, click /api/twitter/authorize or POST /api/twitter/refresh to refresh'
      : 'Token is valid and ready to use'
  });
});

export default router;
