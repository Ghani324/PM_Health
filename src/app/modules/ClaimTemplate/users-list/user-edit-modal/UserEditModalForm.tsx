import {FC, useState,useEffect} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import {isNotEmpty, toAbsoluteUrl} from '../../../../../_metronic/helpers'
import {initialUser, User} from '../core/_models'
import clsx from 'clsx'
import {useListView} from '../core/ListViewProvider'
import {UsersListLoading} from '../components/loading/UsersListLoading'
import {createUser, updateUser} from '../core/_requests'
import {useQueryResponse} from '../core/QueryResponseProvider'
import {useQueryResponseDataAll} from "../core/QueryResponseProviderAll";
import {getPmAll} from '../core/_requests'
import { Retryer } from 'react-query/types/core/retryer'
import axios from 'axios'
const API_URL = process.env.REACT_APP_THEME_API_URL
const pmsystemUrl = `/api/pmsystem/getPmList`
type Props = {
  isUserLoading: boolean
  user: User,
}


const editUserSchema = Yup.object().shape({

  PracticeName: Yup.string().required('Practice Name is required'),
  PmId: Yup.string().required('PM System is required'),
  ClaimLevel : Yup.string().required('Claim Level is required'),
})


const UserEditModalForm: FC<Props> = ({user, isUserLoading}) => {
  const {setItemIdForUpdate} = useListView()
 
  const {refetch} = useQueryResponse()
  const [userForEdit] = useState<User>({
    ...user,
    PracticeName: user.PracticeName || initialUser.PracticeName,
    PmId: user.PmId || initialUser.PmId,
    ClaimLevel : user.ClaimLevel || initialUser.ClaimLevel,
  })
 const[datas , setdatas]= useState([{PmName :""}])
  
  const cancel = (withRefresh?: boolean) => {
    if (withRefresh) {
      refetch()
    }
    setItemIdForUpdate(undefined)
  }
  useEffect(() => {
    Getdata();
  },[])
  
  const Getdata=async()=>{
    
    const Result = await axios.get(pmsystemUrl)
    console.log("Result",Result.data)
    if(Result.data){
      setdatas(Result.data.data)
    }
  }
  

  const formik = useFormik({
    initialValues: userForEdit,
    validationSchema: editUserSchema,
    onSubmit: async (values, {setSubmitting}) => {
      console.log("values",values)
      setSubmitting(true)
      try {
        if (isNotEmpty(values.id)) {
          await updateUser(values)
        } else {
          await createUser(values)
        }
      } catch (ex) {
        console.error(ex)
      } finally {
        setSubmitting(true)
        cancel(true)
      }
    },
  })
  // const handleDropListOrder = (datas) => {
  
  //   return datas.map((el) => <option>{el.PmName}</option>);
  // };
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
            <label className='required fw-bold fs-6 mb-2'>Practice Name</label>
            {/* end::Label */}

            {/* begin::Input */}
            <input
              placeholder='Practice Name'
              {...formik.getFieldProps('PracticeName')}
              type='text'
              name='PracticeName'
              className={clsx(
                'form-control form-control-solid mb-3 mb-lg-0',
                {'is-invalid': formik.touched.PracticeName && formik.errors.PracticeName},
                {
                  'is-valid': formik.touched.PracticeName && !formik.errors.PracticeName,
                }
              )}
              autoComplete='off'
              disabled={formik.isSubmitting || isUserLoading}
            />
            {formik.touched.PracticeName && formik.errors.PracticeName && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>
                  <span role='alert'>{formik.errors.PracticeName}</span>
                </div>
              </div>
            )}
            {/* end::Input */}
          </div>
          {/* end::Input group */}

          <div className='fv-row mb-7'>
              <label className='col-lg-4 col-form-label fw-bold fs-6'>
                  <span className='required'>PM System</span>
                </label>
                <select id="PmId" {...formik.getFieldProps('PmId')}  className='form-select form-select-solid form-select-lg fw-bold'>
                  <option value=''>PM System</option>
                  {/* <handleDropListOrder /> */}
                  {
                    datas.map((res,index)=>{
                      return (<option key={index}>{res.PmName}</option>)

                    })
                  }
                </select>
              </div>
              {formik.touched.PmId && formik.errors.PmId && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.PmId}</div>
                </div>
              )}

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
