const send = ({ res, code = 200, data, message, error, meta } = {}) => {
  const status = error ? 'error' : 'success';
  res.status(code).json({ status, message, data, error, meta });
};

export const response = {
  send,
};
