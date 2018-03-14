import { OHIF } from 'meteor/ohif:core';

Meteor.startup(function () {
    const services = Meteor.settings.private.oAuth;

    for( let service in services ) {
        ServiceConfiguration.configurations.upsert( { service: service }, {
          $set: services[ service ]
        });
    }
});

// const services = Meteor.settings.private.oAuth;

// const configure = () => {
//   if ( services ) {
//     for( let service in services ) {
//       ServiceConfiguration.configurations.upsert( { service: service }, {
//         $set: services[ service ]
//       });
//     }
//   }
// };

// OHIF.server.configureServices = configure;