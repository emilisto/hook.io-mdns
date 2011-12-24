var mdns = require('mdns'),
    util = require('util'),
    Hook = require('hook.io').Hook;

var defaults = {
  'mdns-regtype': 'hookio',
  'mdns-listen-timeout': 500
};

var mDNSHook = exports.mDNSHook = function(options) {
  Hook.call(this, options);
};
util.inherits(mDNSHook, Hook);

// Override of listen that accepts mdns parameters and
// advertises hook.io instance upon successful listening.
var listen = Hook.prototype.listen;
mDNSHook.prototype.listen = function(options, callback) {
  var self = this;

  listen.call(this, options, function(err) {

    if(err) {
      // FIXME: this should prolly be handled differently
      callback(new Error('Listening failed: ' + err));
    }

    options = options || {};

    var regtype = options['mdns-regtype'] || defaults['mdns-regtype'];
    var port = self['hook-port'];

    var _options = {};
    if(options['mdns-name']) _options['name'] = options['mdns-name'];
    if(options['mdns-domain']) _options['domain'] = options['mdns-domain'];
    if(options['mdns-host']) _options['host'] = options['mdns-host'];

    var ad = mdns.createAdvertisement(
      regtype, port, options
    );
    ad.start();

    // FIXME: Check so that advertisement was successful

    if(callback) callback.apply(null, arguments);
  });

};

//
// Browses mDNS for hookio services with matching regtype and port
// and connects to it if found. Gives up after options 
// 'mdns-listen-timeout' ms.
//
// TODO: implement mdns-domain to specify search area to non-local (I think)
// TODO: instead of connecting to first found, make it possible to chose 
//       from multiple ones through some sort of prioritization.
//
var connect = Hook.prototype.connect;
mDNSHook.prototype.connect = function(options, callback) {
  var self = this;
  var browser = mdns.createBrowser(defaults['mdns-regtype']);

  var timer = setTimeout(function() {
    // Stop listening for services, important for app
    // to not enter an infinite loop
    browser.stop();

    if(callback) callback(new Error('Unable to connect'));
  }, defaults['mdns-listen-timeout']);


  var _connect = function(host, port) {
    browser.stop();

    options = options || {};
    options['hook-host'] = host;
    options['hook-port'] = port;

    connect.call(self, options, callback);
    clearTimeout(timer);
  };

  browser.on('serviceUp', function(info, flags) {
    var host = info.addresses[0],
        port = info.port;

    if(options.port) {
      if(options.port === port) {
        _connect(host, port);
      }
    } else {
      // If no port is not specified, connect to any hook found
      _connect(host, port);
    }
  });
  browser.on('serviceDown', function(info, flags) {
    // TODO: use when implementing support for multiple services
  });

  browser.start();
};

//
// Reversed version of the default start: 
// tries to connect first, and then falls back on listen
mDNSHook.prototype.start = function (options, callback) {
  var self = this;

  self.connect(options, function(err) {
    if(!err) {
      // Connect to existing
      if(callback) callback.apply(null, arguments);
    } else {
      // ... or start your own show
      self.listen.call(self, options, callback);
    }
  });
};
