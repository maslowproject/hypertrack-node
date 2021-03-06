'use strict';

HyperTrack.DEFAULT_HOST = 'api.hypertrack.com';
HyperTrack.DEFAULT_PORT = '443';
HyperTrack.DEFAULT_BASE_PATH = '/api/v1/';
HyperTrack.DEFAULT_API_VERSION = null;

// Use node's default timeout:
HyperTrack.DEFAULT_TIMEOUT = require('http').createServer().timeout;

HyperTrack.PACKAGE_VERSION = require('../package.json').version;

HyperTrack.USER_AGENT = {
  bindings_version: HyperTrack.PACKAGE_VERSION,
  lang: 'node',
  lang_version: process.version,
  platform: process.platform,
  publisher: 'hypertrack',
  uname: null,
};

HyperTrack.USER_AGENT_SERIALIZED = null;

var exec = require('child_process').exec;

var resources = {
  Places : require('./resources/Places'),
  Users: require('./resources/Users'),
  Events: require('./resources/Events'),
  Actions: require('./resources/Actions'),

};

HyperTrack.HyperTrackResource = require('./HyperTrackResource');
HyperTrack.resources = resources;

function HyperTrack(key) {
  if (!(this instanceof HyperTrack)) {
    return new HyperTrack(key);
  }

  this._api = {
    auth: null,
    host: HyperTrack.DEFAULT_HOST,
    port: HyperTrack.DEFAULT_PORT,
    basePath: HyperTrack.DEFAULT_BASE_PATH,
    timeout: HyperTrack.DEFAULT_TIMEOUT,
    agent: null,
    dev: false,
  };

  this._prepResources();
  this.setApiKey(key);
}

HyperTrack.prototype = {

  setHost: function(host, port, protocol) {
    this._setApiField('host', host);
    if (port) {
      this.setPort(port);
    }
    if (protocol) {
      this.setProtocol(protocol);
    }
  },

  setProtocol: function(protocol) {
    this._setApiField('protocol', protocol.toLowerCase());
  },

  setPort: function(port) {
    this._setApiField('port', port);
  },

  setApiKey: function(key) {
    if (key) {
      this._setApiField(
        'auth',
        'Token ' + key
      );
    }
  },

  setTimeout: function(timeout) {
    this._setApiField(
      'timeout',
      timeout == null ? HyperTrack.DEFAULT_TIMEOUT : timeout
    );
  },

  _setApiField: function(key, value) {
    this._api[key] = value;
  },

  getApiField: function(key) {
    return this._api[key];
  },

  getConstant: function(c) {
    return HyperTrack[c];
  },

  getClientUserAgent: function(cb) {
    if (HyperTrack.USER_AGENT_SERIALIZED) {
      return cb(HyperTrack.USER_AGENT_SERIALIZED);
    }
    exec('uname -a', function(err, uname) {
      HyperTrack.USER_AGENT.uname = uname || 'UNKNOWN';
      HyperTrack.USER_AGENT_SERIALIZED = JSON.stringify(HyperTrack.USER_AGENT);
      cb(HyperTrack.USER_AGENT_SERIALIZED);
    });
  },

  _prepResources: function() {
    for (var name in resources) {
      this[name.toLowerCase()] = new resources[name](this);
    }
  },

};

module.exports = HyperTrack;
// expose constructor as a named property to enable mocking with Sinon.JS
module.exports.HyperTrack = HyperTrack;
