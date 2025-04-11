import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';
import { services } from '../shared/services/index.js';

const prisma = new PrismaClient();
const expand = [{ key: 'employee_id', name: 'employee', endpoint: 'http://82.29.197.244:8080/employees' }];

const show = async (req, res) => {
  const doc = new PDFDocument({ margin: 50 });

  const order = await services.crud.show({
    model: 'order',
    target: req.params.id,
    expand,
  });

  const products = await prisma.orderProduct.findMany({
    where: { order_id: req.params.id },
    include: { product: true },
  });

  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename=invoice.pdf',
  });

  doc.pipe(res);

  doc.fontSize(22).text('Factura de Solicitud', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`ID de órden: ${order.id}`).text(`Solicita: ${order.employee.name}`);
  doc.moveDown();

  const tableTop = doc.y;
  const startX = 50;

  const colNo = startX;
  const colSku = colNo + 40;
  const colName = colSku + 120;
  const colSet = colName + 150;
  const colUnty = colName + 190;
  const colTotal = colName + 250;

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('No.', colNo, tableTop)
    .text('SKU', colSku, tableTop)
    .text('Producto', colName, tableTop)
    .text('Sets', colSet, tableTop)
    .text('Unidades', colUnty, tableTop)
    .text('Total', colTotal, tableTop);

  doc
    .moveTo(startX, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  let y = tableTop + 25;
  doc.font('Helvetica');

  products.forEach((item, i) => {
    const sets = Math.floor(item.quantity / item.product.set || 1);
    const unities = item.quantity % item.product.set || 0;

    doc
      .text(i + 1, colNo, y)
      .text(item.product.sku, colSku, y)
      .text(item.product.name, colName, y, { width: 170 })
      .text(sets, colSet, y)
      .text(unities, colUnty, y)
      .text(item.quantity, colTotal, y);
    y += 20;
  });

  doc.end();
};

export const controller = {
  show,
};
