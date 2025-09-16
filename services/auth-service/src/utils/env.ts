import fs from 'fs';

/**
 * Checks if the app is running inside a Docker container.
 */
export const isRunningInDocker = (): boolean => {
  return fs.existsSync('/.dockerenv');
};
