const base = require('@jonahsnider/xo-config');

const config = {...base};

config.rules['unicorn/no-process-exit'] = 'off';
config.rules['unicorn/prefer-module'] = 'off';

module.exports = config;
