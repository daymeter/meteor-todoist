import { v8 as TodoistApi } from 'todoist';

Todoist = {
  serviceName: 'todoist', // https://developer.todoist.com/sync/v8/#user
  whitelistedFields: [
    'id', 'email', 'full_name', 'lang', 'features', 'is_premium', 'time_format', 'token', 'tz_info'
  ],

  retrieveCredential: function (credentialToken, credentialSecret) {
    return OAuth.retrieveCredential(credentialToken, credentialSecret);
  }
};

OAuth.registerService(Todoist.serviceName, 2, null, function (query) {
  var response = getTokens(query);
  var identity = Promise.await(getIdentity(response.accessToken));

  var serviceData = {
    accessToken: response.accessToken,
  };

  var fields = _.pick(identity, Todoist.whitelistedFields);
  _.extend(serviceData, fields);

  return {
    serviceData: serviceData,
    options: { profile: { name: identity.full_name } }
  };
});

// returns an object containing:
// - accessToken
var getTokens = function (query) {
  var config = ServiceConfiguration.configurations.findOne({ service: Todoist.serviceName });
  if (!config) {
    throw new ServiceConfiguration.ConfigError();
  }

  var response;
  try {
    response = HTTP.post("https://todoist.com/oauth/access_token", {
      params: {
        code: query.code,
        client_id: config.clientId,
        client_secret: OAuth.openSecret(config.secret),
        redirect_uri: OAuth._redirectUri(Todoist.serviceName, config),
      }
    });
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with Todoist. " + err.message), { response: err.response });
  }

  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with Todoist. " + response.data.error);
  } else {
    return {
      accessToken: response.data.access_token,
    };
  }
};

async function getIdentity (accessToken) {
  const todoist = TodoistApi(accessToken);
  try {
    return await (async () => {
      await todoist.sync(['user']);

      return todoist.user.get();
    })();
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Todoist. " + err.message), { response: err.response });
  }
}
