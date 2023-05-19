import {ID, Response} from '../../../../../../_metronic/helpers'
export type User = {
  _id?: any,
  id: ID,
  UserName?: string
  ReportingManager?: string,
  ReportingManagerId?: string,
  PmId? : string,
  PracticeId?: string,
  PmName? :string,
  PracticeName?: string

  
}

export type UsersQueryResponse = Response<Array<User>>

export const initialUser: User = {
  _id: null,
  id: null,
  UserName: '',
  ReportingManager: '',
  ReportingManagerId: '',
  PmId : "",
  PracticeId: "",
  PmName: '',
  PracticeName: '',
}
