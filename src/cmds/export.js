const WerckerApi = require("../api").WerckerApi;
exports.command = "export [organization] [app] [pipeline]";
exports.desc = "Export env variables from pipeline";
exports.builder = {
  token: {
    required: true
  },
  "include-application": {
    type: "boolean",
    default: false
  }
};
exports.handler = async function(argv) {
  const api = new WerckerApi(argv.token);
  if (argv.includeApplication) {
    const app = await api.getApp(argv.organization, argv.app);
    const appEnvvars = await api.getEnvironmentVariablesForApplicationId(
      app.id
    );
    console.log(formatEnvironmentVariables(appEnvvars));
  }

  const src = await api.getPipelineByName(
    argv.organization,
    argv.app,
    argv.pipeline
  );
  if (src) {
    const srcEnvvars = await api.getEnvironmentVariablesForPipelineId(src.id);
    console.log(formatEnvironmentVariables(srcEnvvars));
  } else {
    console.error(`No pipeline with name: ${argv.pipeline}`);
  }
};

function formatEnvironmentVariables(envvars) {
  return envvars
    .map(e => `X_${e.key}=${e.protected ? "protected" : e.value}`)
    .join("\n");
}
