const Houra = require('houra');
const Path = require('path');
const Joi = require('joi');

const internals = {};

internals.ResourcePlugin = module.exports = (server, options, next) => {

  options = Joi.attempt(options, Joi.object({
    controller: Joi.object({
      path: Joi.string(),
      options: Joi.object().default()
    }).default(),
    adapters: Joi.object(),
    connections: Joi.object(),
    models: Joi.array()
  }).default().label('options'));

  const {adapters, connections, models} = options;

  server.dogwater({adapters, connections, models});

  const {path, options:controllerOptions} = options.controller;

  const controller = require(path);

  if (!controller || typeof controller !== 'function') {
    throw new Error(`Invalid controller: Must be a function`);
  }

  try {
    const routes = controller(controllerOptions);

    server.route(routes);
  } catch (err) {
    throw new Error(`Invalid controller: ${err.stack}`);
  }


  next();
};

internals.ResourcePlugin.attributes = {
  name: 'resource'
};