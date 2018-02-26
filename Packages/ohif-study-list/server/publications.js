import { Meteor } from 'meteor/meteor';
import { OHIF } from 'meteor/ohif:core';

Meteor.publish('studyImportStatus', () => OHIF.studylist.collections.StudyImportStatus.find());
Meteor.publish('allUsers', () => Meteor.users.find({}, {fields:{profile: true, emails: true, studyInbox: true}}));
