const Boom = require('boom');
const Joi = require('joi');

const internals = {
  capitalize: require('lodash.capitalize')
};



module.exports = (resourceId, {path} = {}) => {

  if (!path) {
    path = '/'+resourceId;
  }

  if (!path.startsWith('/')) {
    path = '/'+path;
  }

  const loadItem = (model, id) => {
    return model.findOne(id)
      .then(resp => {

        if (!resp) {
          return Boom.notFound(`${internals.capitalize(resourceId)} not found`)
        }
        return resp;
      }).catch(err => {
        console.error(err.stack)
      });
  };

  return  [{
    path,
    method: 'GET',
    config: {
      handler: function (request, reply) {
        reply(request.collections()[resourceId].find());
      }
    }
  }, {
    path: path+'/{id}',
    method: 'GET',
    config: {
      handler: function (request, reply) {

        const model = request.collections()[resourceId];

        reply(loadItem(model, request.params.id));
      }
    }
  }, {
    method: 'POST',
    path,
    config: {
      validate: {
        payload: Joi.object().min(1).label('payload')
      },
      handler: function (request, reply) {

        const creating = request.collections()[resourceId].create(request.payload)
         .catch(err => {
            return Boom.badRequest(err.details);
          });

        reply(creating);
      }
    }
  }, {
    method: 'PATCH',
    path: path+'/{id}',
    config: {
      validate: {
        params: {
          id: Joi.string().label('id').required()
        },
        payload: Joi.object().min(1).label('payload')
      },
      handler: function (request, reply) {

        const model = request.collections()[resourceId];

        const updating = loadItem(model, request.params.id).then(item => {


          Object.assign(item, request.payload);

          return item.save();

        }).catch(err => {

          return err.isBoom
            ? err
            : Boom.badRequest(err.message)
        });

        reply(updating);
      }
    }
  }, {
    path: path+'/{id}',
    method: 'DELETE',
    config: {
      handler: function (request, reply) {


        const deleting = request.collections()[resourceId].destroy({where: {id: request.params.id}})
          .then(resp => {

            if (!resp.length) {
              return Boom.badRequest(`${internals.capitalize(resourceId)} not found`)
            }

          }).catch(err => {
            console.error(err.stack)
          });

        reply(deleting);
      }
    }
  }];
};