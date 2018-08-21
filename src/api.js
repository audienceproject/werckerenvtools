var request = require("request-promise-native");
exports.WerckerApi = class {
  constructor(token) {
    this.token = token;
  }
  async getPipelines(organization, app) {
    var options = {
      method: "GET",
      url: `https://app.wercker.com/api/v3/applications/${organization}/${app}/pipelines`,
      qs: { limit: "60" },
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      json: true
    };

    return await request(options).promise();
  }
  async getOrganization(organization) {
    var options = {
      method: "GET",
      url: `https://app.wercker.com/api/v2/organizations/${organization}`,
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      json: true
    };

    return await request(options).promise();
  }
  async getApp(organization, app) {
    var options = {
      method: "GET",
      url: `https://app.wercker.com/api/v3/applications/${organization}/${app}`,
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      json: true
    };

    return await request(options).promise();
  }
  async getPipelineByName(organization, app, pipeline) {
    const pipelines = await this.getPipelines(organization, app);
    return pipelines.find(p => p.name === pipeline);
  }
  async _getEnvironmentVariablesForScopeWithId(scope, id) {
    var options = {
      method: "GET",
      url: "https://app.wercker.com/api/v3/envvars",
      qs: { scope: scope, target: id },
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      json: true
    };

    var body = await request(options).promise();
    return body.results;
  }
  async getEnvironmentVariablesForApplicationId(appId) {
    return this._getEnvironmentVariablesForScopeWithId("application", appId);
  }
  async getEnvironmentVariablesForOrganizationId(organizationId) {
    return this._getEnvironmentVariablesForScopeWithId(
      "organization",
      organizationId
    );
  }
  async getEnvironmentVariablesForPipelineId(pipelineId) {
    return this._getEnvironmentVariablesForScopeWithId("pipeline", pipelineId);
  }
  async postEnvironmentVariableToPipeline(pipelineId, key, value, isProtected) {
    var options = {
      method: "POST",
      url: "https://app.wercker.com/api/v3/envvars",
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      body: {
        scope: "pipeline",
        target: pipelineId,
        key: key,
        value: value,
        protected: isProtected
      },
      json: true
    };
    await request(options).promise();
  }
  async updateEnvironmentVariable(id, key, value, isProtected) {
    var options = {
      method: "PATCH",
      url: `https://app.wercker.com/api/v3/envvars/${id}`,
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      body: {
        key: key,
        value: value,
        protected: isProtected
      },
      json: true
    };
    await request(options).promise();
  }
  async deleteEnvironmentVariable(id) {
    var options = {
      method: "DELETE",
      url: `https://app.wercker.com/api/v3/envvars/${id}`,
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      json: true
    };
    await request(options).promise();
  }
};
