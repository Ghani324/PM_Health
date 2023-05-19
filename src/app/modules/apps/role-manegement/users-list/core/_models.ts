import {ID, Response} from '../../../../../../_metronic/helpers'
export type User = {
  Permission?: string,
  _id?: any,
  id: ID, 
  role_name?: string,
  rolename?: string,
  status?: string,
  label?: string,
  value?: string,
  UserManagement?: string,
  UploadClaims?: string,
  ViewClaims?: string,
  ViewMyClaims?: string,
  AddNewPM?: string,
  AddNewPractice?: string,
  ARCommentHistory?: string,
  AssignClaim?: string,
  ReportCTR?: string,
  ReportTPD?: string,
  BotCSC?: string,
  ReportPCA?: string
  
}

export type UsersQueryResponse = Response<Array<User>>

export const initialUser: User = {
  Permission: "",
  _id: null,
  id: null,
  role_name: '',
  rolename:'',
  status: '',
  label: '',
  value: '',
  UserManagement: "",
  UploadClaims: "",
  ViewClaims: "",
  ViewMyClaims: "",
  AddNewPM: "",
  AddNewPractice: "",
  ARCommentHistory: "",
  AssignClaim: "",
  ReportCTR: "",
  ReportTPD: "",
  BotCSC: "",
  ReportPCA: ""
  
}
