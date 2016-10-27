const Houra = require('houra');
const Waterline = require('waterline');
const internals = {
  isPlain: require('lodash.isplainobject')
};

module.exports = step => {

  const config = step.bag();

  step.plugin = {
    register: 'dogwater',
    options: {
      adapters: step.bag('adapters', []),
      connections: step.bag('connections', {}),
      models: step.bag('models', []),
      teardownOnStop: step.bag('teardownOnStop', true)
      // models: [
      //   {
      //     identity: 'user',
      //     connection: 'default',
      //     attributes: {
      //       firstName: 'string',
      //       lastName: 'string'
      //
      //       // Add a reference to Pets
      //       // pets: {
      //       //   collection: 'pet',
      //       //   via: 'owner'
      //       // }
      //     }
      //   }
      // ]
    },
  };

  // manifest
  // return server => {
  //   const plugin = (server, options, next) => {
  //     console.log('REALM');
  //     next();
  //   };
  //   plugin.attributes = {name: '42'};
  //   return server.register(plugin).then(() => ({ga: 'bu'}));
  //   // return bag('plugins', []).map(plugin => {
  //   //
  //   //
  //   // });
  // };
};