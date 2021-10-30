Template.configureLoginServiceDialogForTodoist.helpers({
  siteUrl: function () {
    return Meteor.absoluteUrl() + "_oauth/" + Todoist.serviceName;
  }
});

Template.configureLoginServiceDialogForTodoist.fields = function () {
  return [
    {
      property: 'clientId',
      label: 'Client ID'
    },
    {
      property: 'secret',
      label: 'Client secret'
    }
  ];
};
