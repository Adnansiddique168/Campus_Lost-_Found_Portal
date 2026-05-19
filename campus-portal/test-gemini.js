const https = require('https');

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: '/v1beta/models?key=AIzaSyCiWxFfSPfebfg2f2oC43lakfcvZRFOt8k',
  method: 'GET'
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, body));
});

req.on('error', error => console.error(error));
req.end();
