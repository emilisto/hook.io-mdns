var mDNSHook = require('hook.io-mdns').mDNSHook;

var hook = new mDNSHook({
  name: 'sample-mdns-hook'
});

hook.start({
  'hook-port': 5000,
  // Required for hook to listen for non-local connections
  'hook-host': "0.0.0.0",
  'mdns-name': 'Bonjour Madame',
  'mdns-regtype': 'hookio'
});
