import {FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
// import {isNotEmpty, toAbsoluteUrl} from '../../../../../_metronic/helpers'
import {initialUser, User} from '../core/_models'
import clsx from 'clsx'
import {useListView} from '../core/ListViewProvider'
import {UsersListLoading} from '../components/loading/UsersListLoading'
import {createUser, updateUser} from '../core/_requests'
import {useQueryResponse} from '../core/QueryResponseProvider'
import axios from "axios";
import swal from 'sweetalert';
type Props = {
  isUserLoading: boolean
  user: User
}

const API_URL = process.env.REACT_APP_THEME_API_URL
const getPmSystemByName = `/api/pmsystem/getPmSystemByName`

const editUserSchema = Yup.object().shape({
  ClaimLevel : Yup.string().required('Claim Level is required'),
  PmName: Yup.string().required('Name is required'),
})

const UserEditModalForm: FC<Props> = ({user, isUserLoading}) => {
  const {setItemIdForUpdate} = useListView()
  const {refetch} = useQueryResponse()
  const [userForEdit] = useState<User>({
    ...user,
    PmName: user.PmName || initialUser.PmName,
    ClaimLevel : user.ClaimLevel || initialUser.ClaimLevel,
  })

  const cancel = (withRefresh?: boolean) => {
    if (withRefresh) {
      refetch()
    }
    setItemIdForUpdate(undefined)
  }

  const formik = useFormik({
    initialValues: userForEdit,
    validationSchema: editUserSchema,
    onSubmit: async (values, {setSubmitting}) => {
      setSubmitting(true)
      if(!values._id){
        const Result = await axios.get(`${getPmSystemByName}?PmName=${values.PmName}`)
        if (Result.data.Response) {
          swal({
            title: "",
            text: `${values.PmName} Already Exists`,
            icon: "error",
          })
          setSubmitting(false)
          return false;
        }
      }
      try {
          var test :any
          test = await createUser(values)
          console.log("test",test.PmName)
      } catch (ex) {
        console.error(ex)
      } finally {

        if(values._id){
          swal({
            title: "Success",
            text: `${values.PmName} Updated Successfully...`,
            icon: "success",
          })
          .then((res:any)=>{
               setSubmitting(true)
               cancel(true)
             })
        }else {
          swal({
            title: "Success",
            text: `${values.PmName} Created Successfully...`,
            icon: "success",
          })
          .then((res:any)=>{
               setSubmitting(true)
               cancel(true)
             })
        }

      }
    },
  })

  return (
    <>
      <form id='kt_modal_add_user_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        {/* begin::Scroll */}
        <div
          className='d-flex flex-column scroll-y me-n7 pe-7'
          id='kt_modal_add_user_scroll'
          data-kt-scroll='true'
          data-kt-scroll-activate='{default: false, lg: true}'
          data-kt-scroll-max-height='auto'
          data-kt-scroll-dependencies='#kt_modal_add_user_header'
          data-kt-scroll-wrappers='#kt_modal_add_user_scroll'
          data-kt-scroll-offset='300px'
        >
          {/* begin::Input group */}
          
          {/* begin::Input group */}
          <div className='fv-row mb-7'>
            {/* begin::Label */}
            <label className='required fw-bold fs-6 mb-2'>PM System Name</label>
            {/* end::Label */}

            {/* begin::Input */}
            <input
              placeholder='PM Name'
              {...formik.getFieldProps('PmName')}
              type='text'
              name='PmName'
              className={clsx(
                'form-control form-control-solid mb-3 mb-lg-0',
                {'is-invalid': formik.touched.PmName && formik.errors.PmName},
                {
                  'is-valid': formik.touched.PmName && !formik.errors.PmName,
                }
              )}
              autoComplete='off'
              disabled={formik.isSubmitting || isUserLoading}
            />
            {formik.touched.PmName && formik.errors.PmName && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>
                  <span role='alert'>{formik.errors.PmName}</span>
                </div>
              </div>
            )}
            {/* end::Input */}
          </div>
          <div className='fv-row mb-7'>
              <label className='col-lg-4 col-form-label fw-bold fs-6'>
                  <span className='required'>Claim Level</span>
                </label>
                <select id="ClaimLevel" {...formik.getFieldProps('ClaimLevel')}  className='form-select form-select-solid form-select-lg fw-bold'>
                  <option value=''>Select</option>
                  <option value='1'>Claim Based</option>
                  <option value='2'>Line Based</option>
                </select>
              </div>
              {formik.touched.ClaimLevel && formik.errors.ClaimLevel && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.ClaimLevel}</div>
                </div>
              )}
          {/* end::Input group */}
        </div>
        {/* end::Scroll */}

        {/* begin::Actions */}
        <div className='text-center pt-15'>
          <button
            type='reset'
            
            onClick={() => cancel()}
            className='btn btn-light me-3'
            data-kt-users-modal-action='cancel'
            disabled={formik.isSubmitting || isUserLoading}
          >
            Discard
            
          </button>

          <button
            type='submit'
            className='btn btn-primary'
            data-kt-users-modal-action='submit'
            disabled={isUserLoading || formik.isSubmitting || !formik.isValid || !formik.touched}
          >
            <span className='indicator-label'>Submit</span>
            
            {(formik.isSubmitting || isUserLoading) && (
              <span className='indicator-progress'>
                Please wait...{' '}
                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
              </span>
            )}
          </button>
        </div>
        {/* end::Actions */}
      </form>
      {(formik.isSubmitting || isUserLoading) && <UsersListLoading />}
    </>
  )
}

export {UserEditModalForm}
