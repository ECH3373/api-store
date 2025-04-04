import { services } from '../shared/services/index.js';

const include = [{ key: 'product_id', name: 'product' }];
const expand = [{ key: 'employee_id', name: 'employee', endpoint: 'http://82.29.197.244:8080/employees' }];

const index = async (req, res) => {
  const { data, meta } = await services.crud.index({ model: 'cart', query: req.query, include, expand, filters: ['product_id', 'employee_id'] });
  return services.response.send({ res, data, meta, message: 'the list of carts has been successfully retrieved' });
};

const show = async (req, res) => {
  const data = await services.crud.show({ model: 'cart', target: req.params.id, include, expand });
  if (!data) return services.response.send({ res, data, error: 'the carts with the provided ID does not exist' });
  services.response.send({ res, data, message: 'cart successfully retrieved' });
};

const store = async (req, res) => {
  const data = await services.crud.store({ model: 'cart', payload: req.body, keys: ['quantity', 'product_id', 'employee_id'] });
  return services.response.send({ res, data, message: 'cart created successfully' });
};

const update = async (req, res) => {
  const data = await services.crud.update({ model: 'cart', id: req.params.id, payload: req.body, keys: ['quantity'] });
  return services.response.send({ res, data, message: 'cart updated successfully' });
};

const destroy = async (req, res) => {
  const data = await services.crud.destroy({ model: 'cart', id: req.params.id });
  return services.response.send({ res, data, message: 'cart deleted successfully' });
};

export const controller = {
  index,
  show,
  store,
  update,
  destroy,
};
