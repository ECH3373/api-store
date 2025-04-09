import express from 'express';
import 'express-async-errors';
import { config } from './config/index.js';
import { product } from './src/product/index.js';
import { cart } from './src/cart/index.js';
import { order } from './src/order/index.js';
import { OrderProduct } from './src/OrderProduct/index.js';
import { invoice } from './src/invoice/index.js';

const app = express();

app.use(express.json());

app.use('/api/v1/products', product.router);
app.use('/api/v1/carts', cart.router);
app.use('/api/v1/orders', order.router);
app.use('/api/v1/order_products', OrderProduct.router);
app.use('/api/v1/invoices', invoice.router);

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message || 'An error occurred while processing the request' });
});

app.listen(config.app.port, () => {
  console.log(`Server is running on port: http://localhost:${config.app.port}`);
});
