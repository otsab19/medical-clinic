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

export {Gender, TAction, TKeysClinicData, TPrimaryInsurance, IClinicData, keys};
