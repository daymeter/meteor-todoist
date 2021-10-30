// https://developer.todoist.com/guides/#step-1-authorization-request
Todoist = {
    serviceName: 'todoist',

    // Request Todoist credentials for the user
    // @param options {optional}
    // @param credentialRequestCompleteCallback {Function} Callback function to call on
    //   completion. Takes one argument, credentialToken on success, or Error on
    //   error.
    requestCredential: function (options, credentialRequestCompleteCallback) {
        // support both (options, callback) and (callback).
        if (!credentialRequestCompleteCallback && typeof options === 'function') {
            credentialRequestCompleteCallback = options;
            options = {};
        } else if (!options) {
            options = {};
        }

        // Fetch the service configuration from the database
        var config = ServiceConfiguration.configurations.findOne({service: Todoist.serviceName});
        // If none exist, throw the default ServiceConfiguration error
        if (!config) {
            credentialRequestCompleteCallback &&
            credentialRequestCompleteCallback(new ServiceConfiguration.ConfigError());
            return;
        }

        // Generate a token to be used in the state and the OAuth flow
        var credentialToken = Random.secret(),
            loginStyle = OAuth._loginStyle(Todoist.serviceName, config, options);

        OAuth.launchLogin({
            loginService: Todoist.serviceName,
            loginStyle: loginStyle,
            loginUrl: getLoginUrlOptions(loginStyle, credentialToken, config, options),
            credentialRequestCompleteCallback: credentialRequestCompleteCallback,
            credentialToken: credentialToken,
            popupOptions: { width: 445, height: 625 }
        });
    }
};

var getLoginUrlOptions = function(loginStyle, credentialToken, config, options) {
    // Permission scopes can be found here: https://msdn.microsoft.com/en-us/library/hh243648.aspx
    // Per default we need the user to be able to sign in
    var scope = ['data:read'];
    // All other request permissions in the options object is afterward parsed
    if (options.requestPermissions) {
        scope = _.union(scope, options.requestPermissions);
    }

    var loginUrlParameters = {};
    // First insert the ServiceConfiguration values
    if (config.loginUrlParameters){
        _.extend(loginUrlParameters, config.loginUrlParameters)
    }
    // Secondly insert the options that were inserted with the function call,
    // so they will override any ServiceConfiguration
    if (options.loginUrlParameters){
        _.extend(loginUrlParameters, options.loginUrlParameters)
    }
    // Make sure no url parameter was used as an option or config
    var illegal_parameters = ['response_type', 'client_id', 'scope', 'redirect_uri', 'state'];
    _.each(_.keys(loginUrlParameters), function (key) {
        if (_.contains(illegal_parameters, key)) {
            throw new Error('Todoist.requestCredential: Invalid loginUrlParameter: ' + key);
        }
    });

    // Create all the necessary url options
    // https://developer.todoist.com/guides/#step-1-authorization-request
    _.extend(loginUrlParameters, {
        client_id:  config.clientId,
        scope: scope.join(' '), // space delimited, everything is later urlencoded!
        redirect_uri: OAuth._redirectUri(Todoist.serviceName, config),
        state: OAuth._stateParam(loginStyle, credentialToken, options.redirectUrl)
    });

    return 'https://todoist.com/oauth/authorize?' +
        _.map(loginUrlParameters, function(value, param){
            return encodeURIComponent(param) + '=' + encodeURIComponent(value);
        }).join('&');
};
