const Houra = require('houra');
const Directory = require('houra/lib/directory/directory');
const Path = require('path');
const Joi = require('joi');
const internals = {};

internals.toArray = input => {
  if (!(input instanceof Array)) {
    input = [input]
  }
  return input;
};

internals.ResourceStep = module.exports = step => {

  const models = internals.toArray(step.bag('models', [])).map((modelPath) => {

    if (!modelPath || typeof modelPath !== 'string') {
      throw new Error(`Invalid model path (provided: ${modelPath})`);
    }

    return require(Path.join(Houra.path('models'), modelPath));
  });



  const options = Joi.attempt(step.bag('resource'), Joi.object({
    controller: Joi.string().required()
    // options: Joi.object().default()
  }).unknown(true).label('resource').required());

  let {controller:path} = options;
  delete options.controller;


  if (!path.endsWith('.js')) {
    path += '.js';
  }

  path = Path.join(Houra.path('controllers'), path);


  step.plugin = {
    register: './resource',
    options: {
      adapters: step.bag('adapters', []),
      connections: step.bag('connections', {}),
      models,
      controller: {path, options}
    }
  }
};