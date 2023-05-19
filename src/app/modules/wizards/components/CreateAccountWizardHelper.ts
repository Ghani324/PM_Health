import * as Yup from 'yup'

export interface ICreateAccount {
  PmId: string
  PracticeId: Object,
}

const createAccountSchemas = [
  Yup.object({
    PmId: Yup.object().shape({
      value: Yup.string().required("PM System is Required"),
      // etc
    })
    //PmId: Yup.string().required('PM System is Required'),
  }),
  Yup.object().shape({
    PracticeId: Yup.object().shape({
      value: Yup.string().required(),
      // etc
    })
  }),
  // Yup.object().shape({
  //   PracticeId: Yup.object().shape({
  //     value: Yup.string().required(),
  //   })
  // })
  // Yup.object({
  //   PracticeId: Yup.object().required('Practice is Required'),
  // })
]

const inits: ICreateAccount = {
  PmId: '',
  PracticeId: Object
}
export {createAccountSchemas, inits}