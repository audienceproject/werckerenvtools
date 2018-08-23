const WerckerApi = require("../api").WerckerApi;
exports.command = "trim [organization] [app] [pipeline]";
exports.desc =
  "Trim pipeline for variables existing in application or organization";
exports.builder = {
  token: {
    required: true
  },
  overwrite: {
    default: false
  }
};
exports.handler = async function(argv) {
  const api = new WerckerApi(argv.token);
  const dst = await api.getPipelineByName(
    argv.organization,
    argv.app,
    argv.pipeline
  );
  const organization = await api.getOrganization(argv.organization);
  const organizationEnvvars = await api.getEnvironmentVariablesForOrganizationId(
    organization.id
  );
  const app = await api.getApp(argv.organization, argv.app);
  const appEnvvars = await api.getEnvironmentVariablesForApplicationId(app.id);
  const existingKeys = new Set(
    appEnvvars.concat(organizationEnvvars).map(e => e.key)
  );
  const dstEnvvars = await api.getEnvironmentVariablesForPipelineId(dst.id);
  return Promise.all(
    dstEnvvars.filter(e => existingKeys.has(e.key)).map(async e => {
      await api.deleteEnvironmentVariable(e.id);
      console.log(`Deleted key: ${e.key}`);
    })
  );
};
