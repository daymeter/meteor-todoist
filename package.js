Package.describe({
  name: 'daymeter:todoist',
  version: '1.0.0',
  summary: 'An implementation of the Todoist OAuth flow.',
  git: 'https://github.com/daymeter/meteor-todoist',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom(['1.2.1', '2.3']);
  api.use('ecmascript');
  api.use('templating', 'client');
  api.use('random', 'client');
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', 'server');
  api.use('service-configuration', ['client', 'server']);

  api.export('Todoist');

  api.addFiles('client/configure.html', 'client');
  api.addFiles('server/server.js', 'server');
  api.addFiles(['client/client.js', 'client/configure.js'], 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('ecmascript');
  api.use('daymeter:todoist');

  // Tests will follow soon!
  api.addFiles([]);
});

Npm.depends({
  todoist: '0.5.1'
});
