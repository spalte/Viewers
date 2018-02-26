import { OHIF } from 'meteor/ohif:core';

/**
 * Exports all selected studies on the studylist
 * @param event Event that triggered the export
 */
OHIF.studylist.exportSelectedStudies = event => {
    const selectedStudies = OHIF.studylist.getSelectedStudies();
    const studiesCount = selectedStudies.length;
    const studyText = studiesCount > 1 ? 'Studies' : 'Study';

    OHIF.ui.showDialog('dialogConfirm', {
        element: event.element,
        title: `Export ${studyText}`,
        message: `Would you like to export ${studiesCount} ${studyText.toLowerCase()}?`
    }).then(() => {
        OHIF.studylist.exportStudies(selectedStudies);
    }).catch(() => {});
};

OHIF.studylist.shareSelectedStudies = event => {
    const selectedStudies = OHIF.studylist.getSelectedStudies();
    const studiesCount = selectedStudies.length;
    const studyText = studiesCount > 1 ? 'Studies' : 'Study';

    OHIF.ui.showDialog('dialogShareStudies', {
        element: event.element,
        selectedStudies: selectedStudies,
        title: `Send ${studyText}`,
        message: `To who would you like to send ${studiesCount} ${studyText.toLowerCase()}?`
    });
};

OHIF.studylist.deleteStudies = event => {
    const selectedStudies = OHIF.studylist.getSelectedStudies();
    const studiesCount = selectedStudies.length;
    const studyText = studiesCount > 1 ? 'Studies' : 'Study';

    OHIF.ui.showDialog('dialogConfirm', {
        element: event.element,
        title: `Delete ${studyText}`,
        message: `Are you sure you want to delete ${studiesCount} ${studyText.toLowerCase()}?`
    }).then(() => {
        const studyUids = selectedStudies.map(study => study.studyInstanceUid);
        Meteor.call('studyList.deleteStudies', studyUids);
    }).catch(() => {});
};
