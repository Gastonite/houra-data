const Houra = require('houra');
const Path = require('path');
const Joi = require('joi');
const internals = {};

internals.toArray = input => {
  if (!(input instanceof Array)) {
    input = [input]
  }
  return input;
};
internals.loadModels = models => {
  return internals.toArray(models).map((modelPath) => {

    if (!modelPath || typeof modelPath !== 'string') {
      throw new Error(`Invalid model path (provided: ${modelPath})`);
    }

    return require(Path.join(Houra.path('models'), modelPath));
  });
};

internals.loadAdapters = adapters => {

  Object.keys(adapters || {}).forEach((name) => {
    if (typeof adapters[name] !== 'string') {
      throw new Error(`"adapters" must be a strings (provided: ${typeof adapters[name]})`);
    }

    adapters[name] = require(adapters[name]);
  });
};



module.exports = step => {

  const models = internals.toArray(step.bag('models', [])).map((modelPath) => {

    if (!modelPath || typeof modelPath !== 'string') {
      throw new Error(`Invalid model path (provided: ${modelPath})`);
    }

    return require(Path.join(Houra.path('models'), modelPath));
  });

  const options = Joi.attempt(step.bag('resource'), Joi.object({
    controller: Joi.string().min(1)
  }).unknown(true).label('resource').required());

  let {controller:controllerPath} = options;


  if (controllerPath) {

    if (!Path.isAbsolute(controllerPath)) {
      controllerPath = Path.join(Houra.path('controllers'), controllerPath);
    }

    delete options.controller;

  } else {

    controllerPath = step.path('controllers', 'default');
  }


  const register = (server, options, next) => {

    const {adapters, connections, models} = options = Joi.attempt(options, Joi.object({
      controller: Joi.object({
        path: Joi.string(),
        options: Joi.object().default()
      }).default(),
      adapters: Joi.object(),
      connections: Joi.object(),
      models: Joi.array()
    }).default().label('options'));

    if (adapters) {
      internals.loadAdapters(adapters);
    }

    server.dogwater({adapters, connections, models});

    const {path, options:controllerOptions} = options.controller;

    const controller = require(path);

    if (!controller || typeof controller !== 'function') {
      throw new Error(`Invalid controller: Must be a function`);
    }

    try {

      const routes = controller(step.id, controllerOptions);
      server.route(routes);

    } catch (err) {
      throw new Error(`Invalid controller: ${err.stack}`);
    }


    next();
  };

  register.attributes = {
    name: 'resource-'+step.id
  };

  return {
    register,
    options: {
      adapters: step.bag('adapters', []),
      connections: step.bag('connections', {}),
      models,
      controller: {path: controllerPath, options}
    }
  };
};