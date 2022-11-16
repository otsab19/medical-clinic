import {textFromCamelCase} from "./utils.js";

enum Gender{
    MALE='Male',FEMALE ='Female'
}
type TAction = 'view' | 'add';

type TPrimaryInsurance = "Medicare" | "Private Health Insurance";
interface IClinicData {
    patientId: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: Gender;
    primaryInsurance: TPrimaryInsurance;
    contactNumber: string;
    address: string;
    nextOfKin?: string;
}

type TKeysClinicData = keyof IClinicData;

const keys: TKeysClinicData[] = ['patientId', 'firstName', 'lastName', 'dob', 'gender', 'primaryInsurance', 'contactNumber', 'address', 'nextOfKin'];

let params: {editIndex: number; editMode: boolean};

const clinicData: IClinicData[] = [];

const initParams = () => {
    params = {
        editMode: false,
        editIndex: null
    };
};

initParams();

const onAdd = () => {
    const elem = document.getElementById('form') as HTMLFormElement;
    elem.style.display = 'block';
    clearMedicalList();
    toggleSearch(true);
    makeButtonActive('add');
};
const renderData = (item:IClinicData) => {
    const list = document.getElementById('medical-list');
    const node = document.createElement("div");
    node.className = 'list-item';
    const deleteElem = document.createElement("button");
    deleteElem.onclick = () => {
        if(confirm("Are you sure you want to delete the record?")){
            const index = clinicData.findIndex(d => d.patientId === item.patientId);
            clinicData.splice(index, 1);
            handleAction('view');
        }
    };
    deleteElem.innerHTML = 'Delete';
    deleteElem.className = 'deleteButton';
    const editElem = document.createElement("button");
    editElem.innerHTML = 'Edit';
    editElem.className = 'editButton'
    editElem.onclick = () => {
        onAdd();
        makeButtonActive('add', true);
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
    };
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
    elem.innerHTML = show? 'No Data' : '';
};

// Clear html list from DOM
const clearMedicalList = () => {
    const list = document.getElementById('medical-list');
    list.innerHTML = null;
};

const renderMedicalList = (clinicData: IClinicData[]) => {
    clearMedicalList();
    if(!clinicData?.length){
        toggleNoDataRender(true);
        return;
    }
    toggleNoDataRender(false);
    clinicData.forEach((d) => {
        renderData(d);
    })
};


const renderError = (errors: string[]) => {
    const elem = document.getElementById('errors');
    elem.append(`Please fix the errors: `);
    errors.forEach((err) => {
        const node = document.createElement("div");
        node.className = 'error-list-item';
        node.innerHTML = `<span>${err}</span>`;
        elem.append(node);
    });
};
const clearErrors = () => {
    const elem = document.getElementById('errors');
    elem.innerHTML = null;
};

const getInValidFormItems: (formData:IClinicData) => string[] = (formData) => {
    const errors:string[] = [];
    const isIdInValid = clinicData.find(d => d.patientId === formData.patientId);
    if(isIdInValid){
        errors.push('Id is already used');
    }
    Object.keys(formData).forEach((key: TKeysClinicData) => {
        // check for future date
        if(key === 'dob' && formData[key]){
            const today = new Date();
            today.setHours(0,0,0,0);
            if((new Date(formData[key])) > today){
                errors.push('Future Date is invalid.')
            }
            return;
        }
       if(!formData[key] && key !== 'nextOfKin'){
           errors.push(textFromCamelCase(key) + ' is required');
       }
    });
    return errors;
};
renderMedicalList(clinicData);

const resetForm = () => {
    //clean form values
    const elem = document.getElementById('form') as HTMLFormElement;
    elem.reset();
};
/* Add data from form */
const addClinicData = (data: IClinicData):void => {
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
    const errors = getInValidFormItems(formData);

    //check if edit or add mode
    const isEditMode = params.editMode;

    const idErrorIdx = errors.indexOf('Id is already used');
    // in edit mode no need to check unique patient id
    if(idErrorIdx>=0 && isEditMode){
        errors.splice(idErrorIdx, 1);
    }
    if (!errors?.length) {
        clearErrors();
        isEditMode ? editClinicData(formData as unknown as IClinicData) : addClinicData(formData as unknown as IClinicData);
    } else {
        clearErrors();
        window.scrollTo(0,0);
        renderError(errors);
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

const makeButtonActive = (buttonId:'add' | 'view', bothInactive?:boolean) => {
    const activeElem = document.getElementById(`${buttonId}Button`) as HTMLFormElement;
    const inactiveElem = document.getElementById(buttonId === 'add' ? 'viewButton' : 'addButton') as HTMLFormElement;
    activeElem.className = bothInactive ? '' : 'active';
    inactiveElem.className = '';
};


/* Handle crud action*/
const handleAction = (action: TAction) => {
    let elem;
    switch (action){
        case 'add':
            onAdd();
            if(params.editMode){
                hideFormButton('edit');
                resetForm();
                initParams();
            }
            return;

        case "view":
            elem = document.getElementById('form') as HTMLFormElement;
            elem.style.display = 'none';
            renderMedicalList(clinicData);
            toggleSearch();
            makeButtonActive('view');
            initParams();
            clearErrors();
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
//search
document.getElementById("search").onchange = (e) => {
    handleSearch(e);
};

const init = () => {

    Array.from(Array(10).keys()).forEach((i) => {
        const d = (`${Date.now()} ${i}`).slice(5);
        addClinicData(
            {
                address: `Address ${d}`,
                contactNumber: `123456 ${i}`,
                dob: '2021-01-01',
                firstName: `First Name ${d}`,
                gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
                lastName: `Last Name ${d}`,
                patientId: `${d}`,
                primaryInsurance: i%2 === 0 ? 'Medicare' : 'Private Health Insurance'
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
