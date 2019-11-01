const randomstring = require('randomstring');

export const randStr = (len) => {
  const strlen = len || 16;
  return randomstring.generate(strlen);
};
