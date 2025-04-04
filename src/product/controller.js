import { services } from '../shared/services/index.js';

const index = async (req, res) => {
  const { data, meta } = await services.crud.index({ model: 'product', query: req.query, search: ['sku', 'name'] });
  return services.response.send({ res, data, meta, message: 'the list of products has been successfully retrieved' });
};

const show = async (req, res) => {
  const data = await services.crud.show({ model: 'product', target: req.params.id, keys: ['id', 'sku'] });
  if (!data) return services.response.send({ res, data, error: 'the product with the provided ID does not exist' });
  services.response.send({ res, data, message: 'product successfully retrieved' });
};

const store = async (req, res) => {
  const data = await services.crud.store({ model: 'product', payload: req.body, keys: ['sku', 'name', 'description', 'set', 'image'] });
  return services.response.send({ res, data, message: 'product created successfully' });
};

const update = async (req, res) => {
  const data = await services.crud.update({ model: 'product', id: req.params.id, payload: req.body, keys: ['name', 'description', 'set', 'image'] });
  return services.response.send({ res, data, message: 'product updated successfully' });
};

const destroy = async (req, res) => {
  const data = await services.crud.destroy({ model: 'product', id: req.params.id });
  return services.response.send({ res, data, message: 'product deleted successfully' });
};

export const controller = {
  index,
  show,
  store,
  update,
  destroy,
};
