import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const index = async ({ model, query = {}, search = [], filters = [], include = [], expand = [] }) => {
  // params
  const page = parseInt(query.page) || 1;
  const take = parseInt(query.limit) || 10;
  const skip = (page - 1) * take;

  let orderBy = [];
  if (query.sort && Array.isArray(query.sort)) {
    orderBy = query.sort;
  } else if (query.sort) {
    try {
      const parsed = JSON.parse(query.sort);
      if (Array.isArray(parsed)) orderBy = parsed;
    } catch (e) {}
  }

  let where = {};
  if (query.search && search.length > 0) {
    const searchTerm = query.search.trim();
    where.OR = search.map((field) => ({ [field]: { contains: searchTerm } }));
  }

  filters.forEach((field) => {
    let value = query[field];
    if (value !== undefined) {
      if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value);
        } catch (e) {}
      }
      where[field] = Array.isArray(value) ? { in: value } : value;
    }
  });

  //include
  const prismaInclude = {};
  const keysToRemove = [];

  for (const item of include) {
    if (item.name) {
      prismaInclude[item.name] = true;
      if (item.key) keysToRemove.push(item.key);
    }
  }

  // query
  const data = await prisma[model].findMany({ skip, take, orderBy, where, include: Object.keys(prismaInclude).length > 0 ? prismaInclude : undefined });
  const total = await prisma[model].count({ where });

  if (keysToRemove.length > 0)
    data.forEach((item) => {
      keysToRemove.forEach((field) => {
        delete item[field];
      });
    });

  //expand
  if (expand.length > 0) {
    for (const { key, name, endpoint } of expand) {
      const uniqueIds = [...new Set(data.map((item) => item[key]))];

      const relatedData = await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const response = await axios.get(`${endpoint}/${id}`);
            return { id, result: response.data.data };
          } catch (e) {
            console.warn(`Error al expandir ${key} con id ${id}:`, e.message);
            return null;
          }
        }),
      );

      const map = Object.fromEntries(relatedData.filter((item) => item && item.result).map(({ id, result }) => [id, result]));

      data.forEach((item) => {
        if (map[item[key]]) {
          item[name] = map[item[key]];
          delete item[key];
        }
      });
    }
  }

  // meta
  const meta = { pagination: { total, page, pages: Math.ceil(total / take) } };

  // response
  return { data, meta };
};

const show = async ({ model, target, keys = ['id'], include = [], expand = [] } = {}) => {
  let data = null;

  //include
  const prismaInclude = {};
  const keysToRemove = [];

  for (const item of include) {
    if (item.name) {
      prismaInclude[item.name] = true;
      if (item.key) keysToRemove.push(item.key);
    }
  }

  for (const key of keys) {
    try {
      const query = { where: { [key]: target }, include: Object.keys(prismaInclude).length > 0 ? prismaInclude : undefined };
      data = await prisma[model].findFirst(query);
      if (data) break;
    } catch (error) {
      console.log(error);
      continue;
    }
  }

  if (!data) return null;

  if (keysToRemove.length > 0) {
    keysToRemove.forEach((field) => {
      delete data[field];
    });
  }

  // expand
  if (expand.length > 0) {
    for (const { key, name, endpoint } of expand) {
      const id = data[key];

      try {
        const response = await axios.get(`${endpoint}/${id}`);
        const result = response.data?.data;

        if (result) {
          data[name] = result;
          delete data[key];
        }
      } catch (error) {
        console.warn(`Error al expandir ${key} con id ${id}:`, error.message);
      }
    }
  }

  return data;
};

const store = async ({ model, payload = {}, keys = [] } = {}) => {
  const filteredData = keys.length ? Object.fromEntries(Object.entries(payload).filter(([key]) => keys.includes(key))) : payload;

  const lowercasedData = Object.fromEntries(Object.entries(filteredData).map(([key, value]) => [key, typeof value === 'string' ? value.toLowerCase() : value]));

  const data = await prisma[model].create({ data: lowercasedData });
  return data;
};

const update = async ({ model, id, payload = {}, keys = [] } = {}) => {
  const filteredData = keys.length ? Object.fromEntries(Object.entries(payload).filter(([key]) => keys.includes(key))) : payload;

  const lowercasedData = Object.fromEntries(Object.entries(filteredData).map(([key, value]) => [key, typeof value === 'string' ? value.toLowerCase() : value]));

  const data = await prisma[model].update({ where: { id }, data: lowercasedData });
  return data;
};

const destroy = async ({ model, id } = {}) => {
  const data = await prisma[model].delete({
    where: { id },
  });

  return data;
};

export const crud = {
  index,
  show,
  store,
  update,
  destroy,
};
