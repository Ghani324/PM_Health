import {ID, Response} from '../../../../../_metronic/helpers'
export type User = {
  _id?: any,
  id : ID,
  PmName?: string,
  ClaimLevel? : string
}

export type UsersQueryResponse = Response<Array<User>>

export const initialUser: User = {
  id : null,
  _id: null,
  PmName: "",
  ClaimLevel : ""
}
