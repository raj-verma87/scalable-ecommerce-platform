/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';

const policyModulePath = path.join(__dirname, '..', 'policies', 'jwt-auth');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const policyModule = require(policyModulePath);

const policyName: string = policyModule.name || 'jwt-auth';
const policyImpl = policyModule.policy;
const policySchema = policyModule.schema || { type: 'object', properties: {} };

module.exports = {
  version: '1.0.0',
  policies: [policyName],
  init: (pluginContext: any) => {
    pluginContext.registerPolicy({ name: policyName, policy: policyImpl, schema: policySchema });
  }
};


