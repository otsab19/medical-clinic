import {textFromCamelCase} from "./utils.js";

enum Gender {
    MALE = 'Male', FEMALE = 'Female'
}

type TAction = 'view' | 'add' | 'viewEmergency';

type TPrimaryInsurance = "Medicare" | "Private Health Insurance";

interface IClinicData {
    patientId: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: Gender;
    primaryInsurance: TPrimaryInsurance;
    contactNumber: number;
    address: string;
    nextOfKin?: string;
    emergency?: boolean;
}

type TKeysClinicData = keyof IClinicData;

const keys: TKeysClinicData[] = ['patientId', 'firstName', 'lastName', 'dob', 'gender', 'primaryInsurance', 'contactNumber', 'address', 'nextOfKin'];

let params: { editIndex: number; editMode: boolean };

const clinicData: IClinicData[] = [];

const initParams = () => {
    params = {
        editMode: false,
        editIndex: null
    };
};

initParams();

const onView = () => {
    const elem = document.getElementById('form') as HTMLFormElement;
    elem.style.display = 'none';

    //show view element
    const viewElem = document.getElementById('medical-list') as HTMLFormElement;
    viewElem.style.display = 'block';
};

const onAdd = () => {
    const elem = document.getElementById('form') as HTMLFormElement;
    elem.style.display = 'block';
    clearMedicalList();
    toggleSearch(true);
    makeButtonActive('add');

    //remove view element
    const viewElem = document.getElementById('medical-list') as HTMLFormElement;
    viewElem.style.display = 'none';
};

const showFormTitle = (id: 'add' | 'edit') => {
    const elem = document.getElementById(`${id}Title`);
    const inactiveElem = document.getElementById(id === 'add' ? 'editTitle' : 'addTitle');
    elem.style.display =  'flex';
    inactiveElem.style.display = 'none'
};

const togglePatientIdFieldDisabled = (type: boolean) => {
    // Make patient id field inactive
    const patientElem = document.getElementById('patientId') as HTMLInputElement;
    if (type) patientElem.disabled = type;
    else patientElem.removeAttribute('disabled');
};

const renderData = (item: IClinicData, onlyEmergency:boolean = false) => {
    const list = document.getElementById('medical-list');
    const node = document.createElement("div");
    node.className = 'list-item';

    // Delete
    const deleteElem = document.createElement("button");
    deleteElem.onclick = () => {
        if (confirm("Are you sure you want to delete the record?")) {
            const index = clinicData.findIndex(d => d.patientId === item.patientId);
            clinicData.splice(index, 1);
            handleAction('view');
        }
    };
    deleteElem.innerHTML = 'Delete';
    deleteElem.className = 'deleteButton';

    //EDIT
    const editElem = document.createElement("button");
    editElem.innerHTML = 'Edit';
    editElem.className = 'editButton'
    editElem.onclick = () => {
        onAdd();
        makeButtonActive('add', true);
        showFormTitle('edit');
        // fill with edited row data
        const currDataIndex = clinicData.findIndex(d => d.patientId === item.patientId);
        keys.forEach((k) => {
            const el = document.getElementById(k) as HTMLFormElement;
            el.value = clinicData[currDataIndex][k] || '';
        });
        // show edit button
        const editElem = document.getElementById('editBtn');
        editElem.style.display = 'block';
        const addElem = document.getElementById('addBtn');
        addElem.style.display = 'none';
        params.editMode = true;
        params.editIndex = currDataIndex;
        togglePatientIdFieldDisabled(true);
    };

    // MArk as EMERGENCY
    const emergencyRoot = document.createElement("div");
    emergencyRoot.className = 'emergencyWrapper';
    emergencyRoot.innerHTML = 'Emergency';
    const emergencyElem = document.createElement("input");
    emergencyElem.id = 'markEmergency';
    emergencyElem.type = 'checkbox';
    emergencyElem.checked = item.emergency;
    emergencyElem.onchange = (e) => {
        item.emergency = (e.target as HTMLInputElement).checked;
    };
    emergencyRoot.append(emergencyElem);

    const group1 = document.createElement("div");
    group1.className = 'flex';
    group1.innerHTML = `
    <span><span class="label">ID:</span> ${item.patientId}</span>
    <span><span class="label">FirstName: </span>${item.firstName}</span>
    <span><span class="label">Last Name</span>${item.lastName}</span>
  `;
    const group2 = document.createElement("div");
    group2.className = 'flex';
    group2.innerHTML = `
    <span><span class="label">Address:</span> ${item.address}</span>
    <span><span class="label">Gender:</span> ${item.gender}</span>
    <span><span class="label">DoB: </span>${item.dob}</span>
  `;

    const group3 = document.createElement("div");
    group3.className = 'flex';
    group3.innerHTML = `
    <span><span class="label">Contact #: </span>${item.contactNumber}</span>
    <span><span class="label">Next of Kin: </span>${item.nextOfKin || ''}</span>
    <span><span class="label">Primary Insurance: </span>${item.primaryInsurance}</span>
  `;
    const group = document.createElement("div");
    group.className = 'flex flex-column';

    group.append(group1);
    group.append(group2);
    group.append(group3);

    if(!onlyEmergency) node.append(emergencyRoot);
    node.append(group);

    const linkNode = document.createElement('div');
    linkNode.className = 'links';
    linkNode.append(deleteElem);
    linkNode.append(editElem);

    node.append(linkNode);

    list.append(node);
};
// no data
const toggleNoDataRender = (show: boolean) => {
    const elem = document.getElementById('noData');
    elem.innerHTML = show ? 'No Data' : '';
};

// Clear html list from DOM
const clearMedicalList = () => {
    const list = document.getElementById('medical-list');
    list.innerHTML = null;
};

const renderMedicalList = (clinicData: IClinicData[], onlyEmergency: boolean = false) => {
    clearMedicalList();
    let toRenderData;
    toRenderData = onlyEmergency ? clinicData.filter(d => d.emergency) : clinicData;
    if (!toRenderData?.length) {
        toggleNoDataRender(true);
        // hide medical-list from DOM
        const viewElem = document.getElementById('medical-list') as HTMLFormElement;
        viewElem.style.display = 'none';
        return;
    }
    toggleNoDataRender(false);
    toRenderData.forEach((d) => {
        renderData(d, onlyEmergency);
    });
};


const renderError = (errorKeys: string[], formData: IClinicData) => {
    const elem = document.getElementById('errors');
    elem.append(`Please fix the errors `);
    const isIdInValid = checkIfPatientIdExist(formData);
    errorKeys.forEach((k) => {
        const elem = document.getElementById(k);
        const errorElem = document.createElement('div');
        errorElem.className = 'error-text';
        if (k === 'patientId' && isIdInValid) {
            errorElem.innerHTML = 'ID is already used.';
            elem.parentNode.insertBefore(errorElem, elem.nextSibling);
            return;
        }
        if (k === 'dob' && formData[k]) {
            errorElem.innerHTML = 'Future Date is invalid.';
            elem.parentNode.insertBefore(errorElem, elem.nextSibling);
            return;
        }
        errorElem.innerHTML = textFromCamelCase(k) + ' is required.';
        elem.parentNode.insertBefore(errorElem, elem.nextSibling);
    });
};

const clearErrors = (availableKeys: TKeysClinicData[] = keys) => {
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

const checkIfPatientIdExist: (formData: IClinicData) => boolean = (formData: IClinicData) => {
    const isIdInValid = clinicData.find(d => d.patientId === formData.patientId);
    return !!isIdInValid;
};

const getInValidFormItems = (formData: IClinicData): TKeysClinicData[] => {
    const errorKeys: TKeysClinicData[] = [];
    Object.keys(formData).forEach((key: TKeysClinicData) => {
        //check for unique id
        if (key === 'patientId' && checkIfPatientIdExist(formData)) {
            errorKeys.push(key);
            return;
        }
        // check for future date
        if (key === 'dob' && formData[key]) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if ((new Date(formData[key])) > today) {
                errorKeys.push(key);
            }
            return;
        }
        if (!formData[key] && key !== 'nextOfKin') {
            errorKeys.push(key);
        }
    });
    return errorKeys;
};
renderMedicalList(clinicData);

const resetForm = () => {
    //clean form values
    const elem = document.getElementById('form') as HTMLFormElement;
    elem.reset();
};
/* Add data from form */
const addClinicData = (data: IClinicData): void => {
    clinicData.push(data);
    resetForm();
    handleAction('view');
};

const editClinicData = (data: IClinicData) => {
    clinicData[params.editIndex] = data;
    resetForm();
    handleAction('view');
};

const handleFormSubmit = (e) => {
    e.preventDefault();
    //cast to defined interface
    const formData = (Object.fromEntries(new FormData(e.target).entries())) as unknown as IClinicData;
    const errorKeys = getInValidFormItems(formData);

    //check if edit or add mode
    const isEditMode = params.editMode;

    const idAlreadyExist = checkIfPatientIdExist(formData);
    // in edit mode no need to check unique patient id
    const idIdx = errorKeys.indexOf('patientId');
    if (idAlreadyExist && isEditMode && idIdx >= 0) {
        errorKeys.splice(idIdx, 1);
    }

    if (!errorKeys?.length) {
        clearErrors();
        isEditMode ? editClinicData(formData as unknown as IClinicData) : addClinicData(formData as unknown as IClinicData);
    } else {
        clearErrors();
        window.scrollTo(0, 0);
        renderError(errorKeys, formData);
    }
};


const toggleSearch = (toggle: Boolean = false) => {
    //hide search as well
    const elemSearch = document.getElementById('search');
    elemSearch.style.display = toggle ? 'none' : 'block';
};

const hideFormButton = (type: 'add' | 'edit') => {
    const elem = document.getElementById(type + 'Btn');
    const counterElem = document.getElementById((type === 'add' ? 'edit' : 'add') + 'Btn');
    elem.style.display = 'none';
    counterElem.style.display = 'block';
};

const makeButtonActive = (buttonId: 'add' | 'view' | 'viewEmergency', bothInactive?: boolean) => {
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


/* Handle crud action*/
const handleAction = (action: TAction) => {
    switch (action) {
        case 'add':
            onAdd();
            if (params.editMode) {
                hideFormButton('edit');
                resetForm();
                clearErrors();
                initParams();
            }
            toggleNoDataRender(false);
            togglePatientIdFieldDisabled(false);
            showFormTitle('add');
            return;

        case "view":
            onView();
            renderMedicalList(clinicData);
            toggleSearch();
            makeButtonActive('view');
            initParams();
            clearErrors();
            return;

        case "viewEmergency":
            onView();
            renderMedicalList(clinicData, true);
            toggleSearch();
            makeButtonActive('viewEmergency');
            initParams();
            clearErrors();
            toggleSearch(true);
            return;
    }
}
const handleSearch = (e: Event) => {
    const searchText = (e.target as HTMLInputElement).value || '';
    const filteredList = clinicData.filter(d => {
        return d?.patientId?.includes(searchText.toLowerCase());
    });
    renderMedicalList(filteredList);
};

//form event
document.getElementById('form').onsubmit = (e) => {
    handleFormSubmit(e);
};
//events for button clicks
document.getElementById("addButton").onclick = () => {
    handleAction('add');
};
document.getElementById("viewButton").onclick = () => {
    handleAction('view');
};

document.getElementById("viewEmergencyButton").onclick = () => {
    handleAction('viewEmergency');
};
//search
document.getElementById("search").onchange = (e) => {
    handleSearch(e);
};

const init = () => {

    //fill random data
    Array.from(Array(10).keys()).forEach((i) => {
        const d = (`${Date.now()}${i}`).slice(5);
        addClinicData(
            {
                address: `Address ${d}`,
                contactNumber: Number(`123456${i}`),
                dob: '2021-01-01',
                firstName: `First Name ${d}`,
                gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
                lastName: `Last Name ${d}`,
                patientId: `${d}`,
                primaryInsurance: i % 2 === 0 ? 'Medicare' : 'Private Health Insurance'
            }
        )
    });
    const elem = document.getElementById('form') as HTMLFormElement;
    elem.style.display = 'none';

    //render data list
    renderMedicalList(clinicData);

    //show active link
    makeButtonActive('view');
    hideFormButton('edit');

};
init();
