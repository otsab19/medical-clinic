import {keys, TKeysClinicData} from "./types.js";

export const togglePatientIdFieldDisabled = (type: boolean) => {
    // Make patient id field inactive
    const patientElem = document.getElementById('patientId') as HTMLInputElement;
    if (type) patientElem.readOnly = type;
    else patientElem.removeAttribute('readOnly');
};


// no data
export const toggleNoDataRender = (show: boolean) => {
    const elem = document.getElementById('noData');
    elem.innerHTML = show ? 'No Data' : '';
};

// Clear html list from DOM
export const clearMedicalList = () => {
    const list = document.getElementById('medical-list');
    list.innerHTML = null;
};


export const clearErrors = (availableKeys: TKeysClinicData[] = keys) => {
    const elem = document.getElementById('errors');
    elem.innerHTML = null;

    // clear input errors
    availableKeys.forEach(k => {
        const elem = document.getElementsByClassName('error-text');
        while (elem [0]) {
            elem[0].parentNode.removeChild(elem[0]);
        }
    });
};

export const makeButtonActive = (buttonId: 'add' | 'view' | 'viewEmergency', bothInactive?: boolean) => {
    const buttons = ['add', 'view', 'viewEmergency'];
    buttons.forEach(button => {
        setTimeout(() => {
            const elem = document.getElementById(`${button}Button`) as HTMLButtonElement;
            if (buttonId === button) {
                elem.className = bothInactive ? '' : 'active';
                return;
            }
            else {
                elem.className = '';
            }
        }, 100);
    });
};


export const toggleSearch = (toggle: Boolean = false) => {
    //hide search as well
    const elemSearch = document.getElementById('search');
    elemSearch.style.display = toggle ? 'none' : 'block';
};

export const hideFormButton = (type: 'add' | 'edit') => {
    const elem = document.getElementById(type + 'Btn');
    const counterElem = document.getElementById((type === 'add' ? 'edit' : 'add') + 'Btn');
    elem.style.display = 'none';
    counterElem.style.display = 'block';
};
export const showFormTitle = (id: 'add' | 'edit') => {
    const elem = document.getElementById(`${id}Title`);
    const inactiveElem = document.getElementById(id === 'add' ? 'editTitle' : 'addTitle');
    elem.style.display =  'flex';
    inactiveElem.style.display = 'none'
};
