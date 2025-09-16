// src/utils/logger.ts
export const log = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(new Date().toISOString(), ...args);
  }
};
export const error = (...args: any[]) => {
  console.error(new Date().toISOString(), ...args);
};
