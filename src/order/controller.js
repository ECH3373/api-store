import { PrismaClient } from '@prisma/client';
import { services } from '../shared/services/index.js';

const prisma = new PrismaClient();

const expand = [{ key: 'employee_id', name: 'employee', endpoint: 'http://82.29.197.244:8080/employees' }];

const index = async (req, res) => {
  const { data, meta } = await services.crud.index({ model: 'order', query: req.query, expand, filters: ['id_employee'] });
  return services.response.send({ res, data, meta, message: 'the list of orders has been successfully retrieved' });
};

const show = async (req, res) => {
  const data = await services.crud.show({ model: 'order', target: req.params.id, expand });
  if (!data) return services.response.send({ res, data, error: 'the order with the provided ID does not exist' });
  services.response.send({ res, data, message: 'order successfully retrieved' });
};

const store = async (req, res) => {
  const data = await services.crud.store({ model: 'order', payload: req.body, keys: ['employee_id'] });
  const products = await prisma.cart.findMany({ where: { employee_id: req.body.employee_id } });

  for (let index = 0; index < products.length; index++) {
    await services.crud.store({ model: 'OrderProduct', payload: { order_id: data.id, product_id: products[index].product_id, quantity: products[index].quantity }, keys: ['order_id', 'product_id'] });
    await services.crud.destroy({ model: 'cart', id: products[index].id });
  }

  return services.response.send({ res, data, message: 'order created successfully' });
};

const update = async (req, res) => {
  const data = await services.crud.update({ model: 'order', id: req.params.id, payload: req.body });
  return services.response.send({ res, data, message: 'order updated successfully' });
};

const destroy = async (req, res) => {
  const data = await services.crud.destroy({ model: 'order', id: req.params.id });
  return services.response.send({ res, data, message: 'order deleted successfully' });
};

export const controller = {
  index,
  show,
  store,
  update,
  destroy,
};
