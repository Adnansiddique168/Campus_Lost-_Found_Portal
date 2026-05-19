const https = require('https');

https.get('https://nominatim.openstreetmap.org/search?q=Lahore+Garrison+University&format=json&limit=1', {
  headers: {
    'User-Agent': 'NodeJS/1.0'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
