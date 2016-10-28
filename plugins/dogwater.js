const Houra = require('houra');
const Dogwater = require('dogwater');
const internals = {};

internals.DogwaterStep = module.exports = ({bag}) => {

  return {
    register: Dogwater,
    options: {
      adapters: bag('adapters', []),
      connections: bag('connections', {}),
      models: bag('models', []),
      teardownOnStop: bag('teardownOnStop', true)
    }
  };
};