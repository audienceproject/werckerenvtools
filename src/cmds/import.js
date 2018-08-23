const WerckerApi = require("../api").WerckerApi;
const fs = require("fs");
exports.command = "import [organization] [app] [pipeline]";
exports.desc = "Import env variables to pipeline";
exports.builder = {
  token: {
    required: true
  },
  file: {
    required: true
  },
  overwrite: {
    default: false
  }
};
exports.handler = async function(argv) {
  const api = new WerckerApi(argv.token);
  var contents = fs.readFileSync(argv.file, "utf8");
  const srcEnvvars = parseContents(contents);
  const dst = await api.getPipelineByName(
    argv.organization,
    argv.app,
    argv.pipeline
  );
  if (dst === undefined) {
    console.error("No pipeline named: " + argv.pipeline);
  } else {
    const app = await api.getApp(argv.organization, argv.app);
    const appEnvvars = await api.getEnvironmentVariablesForApplicationId(
      app.id
    );
    const dstEnvvars = await api.getEnvironmentVariablesForPipelineId(dst.id);
    const existingEnvvars = dstEnvvars.concat(appEnvvars);
    const existingKeys = new Set(existingEnvvars.map(e => e.key));

    if (argv.overwrite) {
      await Promise.all(
        srcEnvvars.filter(e => existingKeys.has(e.key)).map(async e => {
          const id = existingEnvvars.find(e2 => e2.key === e.key).id;
          await api.updateEnvironmentVariable(id, e.key, e.value, e.protected);
          console.log(`Updated env key ${e.key} with: ${e.value}`);
        })
      );
    }
    await Promise.all(
      srcEnvvars.filter(e => !existingKeys.has(e.key)).map(async e => {
        await api.postEnvironmentVariableToPipeline(
          dst.id,
          e.key,
          e.value,
          e.protected
        );
        console.log(`Created env: (${e.key},${e.value})`);
      })
    );
  }
};

function parseContents(contents) {
  return contents
    .trim()
    .split("\n")
    .map(l => l.trim())
    .filter(l => l != "")
    .map(l => {
      const [k, v] = l
        .trim()
        .substring(2)
        .split("=");
      return { key: k, value: v };
    });
}
