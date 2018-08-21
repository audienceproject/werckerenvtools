const WerckerApi = require("../api").WerckerApi;
exports.command = "sync [organization] [app] [src-pipeline] [dst-pipeline]";
exports.desc = "Sync env variables to pipeline";
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
  const src = await api.getPipelineByName(
    argv.organization,
    argv.app,
    argv.srcPipeline
  );
  const dst = await api.getPipelineByName(
    argv.organization,
    argv.app,
    argv.dstPipeline
  );
  const srcEnvvars = await api.getEnvironmentVariablesForPipelineId(src.id);
  const dstEnvvars = await api.getEnvironmentVariablesForPipelineId(dst.id);
  const dstKeys = new Set(dstEnvvars.map(e => e.key));
  if (argv.overwrite) {
    await Promise.all(
      srcEnvvars.filter(e => dstKeys.has(e.key)).map(async e => {
        const id = dstEnvvars.find(e2 => e2.key === e.key).id;
        await api.updateEnvironmentVariable(id, e.key, e.value, e.protected);
        console.log(`Updated env key ${e.key} with: ${e.value}`);
      })
    );
  }
  await Promise.all(
    srcEnvvars.filter(e => !dstKeys.has(e.key)).map(async e => {
      await api.postEnvironmentVariableToPipeline(
        dst.id,
        e.key,
        e.value,
        e.protected
      );
      console.log(`Created env: (${e.key},${e.value})`);
    })
  );
};
