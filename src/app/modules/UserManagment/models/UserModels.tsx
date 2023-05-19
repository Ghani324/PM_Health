// export interface UserDetails {

//     UserName : string,
//     RoleName : string,
//     Prefix : string,
//     ReportingManager : string,
//     FirstName : string,
//     LastName : string,
//     // PmId : string,
//     pm_system? :[],
//     // PmNameList? : object,
//     //  PracticeId? : string,
//     practice_name? :[],
//     // PracticeNameList? : object,
//     Contact: string,
// }
// export const UserDetailsDetails: UserDetails = {
//     UserName: "",
//     RoleName: "",
//     Prefix: "",
//     ReportingManager: "",
//     FirstName: "",
//     LastName: "",
//     //  PmId : "",
//     // PmNameList : [{}],
//     pm_system : [],
//     //  PracticeId : "",
//     // PracticeNameList : [{}],
//     practice_name : [],
//     Contact: "",
// }
export interface UserDetails {

    EmployeeId: string,
    role: string,
    prefix: string,
    reporting_manager: string,
    first_name: string,
    last_name: string,
    pm_system: [],
    practice_name: [],
    contact_number: string,
}
export const UserDetailsDetails: UserDetails = {
    EmployeeId: "",
    role: "",
    prefix: "",
    reporting_manager: "",
    first_name: "",
    last_name: "",
    pm_system: [],
    practice_name: [],
    contact_number: "",
}