import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { OHIF } from 'meteor/ohif:core';

Template.dialogShareStudies.onCreated(() => {
    const instance = Template.instance();

    instance.data.api = {
        save() {
            const formData = instance.data.form.value();
            const studyUids = instance.data.selectedStudies.map(study => study.studyInstanceUid);
            Meteor.call('studyList.shareStudies', formData.username, studyUids);
            instance.$('.modal').modal('hide');
        }
    };

    // instance.currentSchema = new ReactiveVar(dicomSchema);
});

Template.dialogShareStudies.onRendered(() => {
    const instance = Template.instance();

    instance.data.$form = instance.$('form').first();
    instance.data.form = instance.data.$form.data('component');
});
