import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { OHIF } from 'meteor/ohif:core';

console.log('loading the methods');

Meteor.methods({
    'studyList.shareStudies'(username, studies) {
        console.log(username);
        console.log(studies);

        // find the corresponding user document

        let targetUser = Meteor.users.findOne({'services.google.email': username});
        let targetId = targetUser.services.google.id;
        console.log(targetUser);
        console.log(targetId);

        studies.forEach((study) => {
            KHEOPS.shareStudyWithUser(study, targetId);
        });
    },

    'studyList.deleteStudies'(studies) {
        studies.forEach((study) => {
            KHEOPS.deleteStudy(study);
        });
    },
});
