import {ID, Response} from '../../../../../_metronic/helpers'
export type User = {
  id : ID,
  PracticeName?: string,
  PmId? : string,
  PmName? :string,
  PmNameList? : object,
  ClaimLevel? : string
}

export type UsersQueryResponse = Response<Array<User>>

export const initialUser: User = {
  id : null,
  PmName : "",
  PracticeName: "",
  PmId : "",
  PmNameList : [{}],
  ClaimLevel : ""
}
