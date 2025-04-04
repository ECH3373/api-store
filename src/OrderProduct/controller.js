import { services } from '../shared/services/index.js';

const include = [
  { key: 'order_id', name: 'order' },
  { key: 'product_id', name: 'product' },
];

const index = async (req, res) => {
  const { data, meta } = await services.crud.index({ model: 'OrderProduct', query: req.query, include, filters: ['product_id'] });
  return services.response.send({ res, data, meta, message: 'the list of order products has been successfully retrieved' });
};

const show = async (req, res) => {
  const data = await services.crud.show({ model: 'OrderProduct', target: req.params.id, include });
  if (!data) return services.response.send({ res, data, error: 'the order products with the provided ID does not exist' });
  services.response.send({ res, data, message: 'order products successfully retrieved' });
};

const store = async (req, res) => {
  const data = await services.crud.store({ model: 'OrderProduct', payload: req.body, keys: ['product_id'] });
  return services.response.send({ res, data, message: 'order products created successfully' });
};

const update = async (req, res) => {
  const data = await services.crud.update({ model: 'OrderProduct', id: req.params.id, payload: req.body });
  return services.response.send({ res, data, message: 'order products updated successfully' });
};

const destroy = async (req, res) => {
  const data = await services.crud.destroy({ model: 'OrderProduct', id: req.params.id });
  return services.response.send({ res, data, message: 'order products deleted successfully' });
};

export const controller = {
  index,
  show,
  store,
  update,
  destroy,
};
