import {ID, Response} from '../../../../../_metronic/helpers'
export type User = {
  _id?: any,
  id : ID,
  PracticeName?: string,
  PmId? : string,
  PmName? :string,
  PmNameList? : object,
  ClaimLevel? : string,
  ClaimColumns? : any,
  SelectedColumnNames? : [{}],
  DisplayNames? : [{}]
}

export type UsersQueryResponse = Response<Array<User>>

export const initialUser: User = {
  _id: null,
  id : null,
  PmName : "",
  PracticeName: "",
  PmId : "",
  PmNameList : [{}],
  ClaimLevel : "",
  ClaimColumns : "",
  SelectedColumnNames : [{}],
  DisplayNames : [{}]
}
