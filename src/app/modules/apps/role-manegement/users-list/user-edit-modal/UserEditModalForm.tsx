import {FC, useEffect, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import {isNotEmpty, toAbsoluteUrl} from '../../../../../../_metronic/helpers'
import swal from 'sweetalert';
import {initialUser, User} from '../core/_models'
import clsx from 'clsx'
import {useListView} from '../core/ListViewProvider'
import {UsersListLoading} from '../components/loading/UsersListLoading'
import {createUser, updateUser} from '../core/_requests'
import {useQueryResponse} from '../core/QueryResponseProvider'
import axios from 'axios'
import { error } from 'jquery';
const API_URL = process.env.REACT_APP_API_URL
export const REGISTER_URL = `/api/roles/createRole`
const getRoleList = `/api/roles/getRoleList`
const getPermissionRoleList = `/users/getPermissionRoleList`
const getRoleByid = `/api/roles/getRoleByid`

type Props = {
  isUserLoading: boolean
  user: User
}

const editUserSchema = Yup.object().shape({
  role_name : Yup.string().required('Role Name is required'),
  PermissionsList : Yup.string().required('Permission List is required')

})

const UserEditModalForm: FC<Props> = ({user, isUserLoading}) => {
  const {setItemIdForUpdate} = useListView()
  const [data, setData] = useState<User>(initialUser)
  const [RoleNameDatas, setRoleNameDatas] = useState([{ role_name: "", _id: "" }])
  const [datas, setdatas] = useState([{ role_name: "", _id: "" }])
  const [SelectedRoleName, setSelectedRoleName] = useState({})
  const [RolesList, setRolesList] = useState([])
  
  const {refetch} = useQueryResponse()

  const [userForEdit] = useState<User>({
    ...user,
    id: user.id || initialUser.id,
    rolename: user.rolename || initialUser.rolename,
    label: user.label || initialUser.label,
    value: user.value || initialUser.value
  })

  const cancel = (withRefresh?: boolean) => {
    if (withRefresh) {
      refetch()
    }
    setItemIdForUpdate(undefined)
  }

  const Getdata = async () => {
    if(user.id){
      setSelectedRoleName({value:user.id,label:user.role_name})
    }
    const Result = await axios.get(getRoleList)
    console.log("Result", Result.data)
    if (Result.data) {
      setdatas(Result.data.data)
    }


  }


  const gettdata = async () => {

    const getPermissionRoleListData = await axios.get(getPermissionRoleList)
    if (getPermissionRoleListData.data) {
      setRolesList(getPermissionRoleListData.data.data)
    }
    const Result = await axios.get(getRoleList)
    if (Result.data) {
      setRoleNameDatas(Result.data.data)
    }
  }
  useEffect(() => {
    gettdata();
    Getdata();
  }, [])

  const formik = useFormik({
    initialValues: userForEdit,
    validationSchema: editUserSchema,
    onSubmit: async (values, { setSubmitting }) => {
      console.log("values", values)
      setSubmitting(true)
      try {
        var test: any
        test = await createUser(values)
        console.log("test", test.role_name)
        //}
      } catch (ex) {
        console.error(ex)
      } finally {

        if (values._id) {
          swal({
            title: 'Success',
            text: `${values.role_name} Updated Successfully...`,
            icon: "success",
          })
            .then((res: any) => {
              setSubmitting(true)
              cancel(true)
            })
        } else {
          swal({
            title: 'Success',
            text: `${values.role_name} Created Successfully...`,
            icon: "success",
          })
            .then((res: any) => {
              setSubmitting(true)
              cancel(true)
            })
        }

      }
    },
  })

  const getRoleName = async(event: any) => {
    formik.setFieldValue("role_name", event.target.value)
    await axios.post(getRoleByid, { id: event.target.value }).then((res) => {
      if(res.data.data.PermissionsList.length > 0){
        res.data.data.PermissionsList.map((getdat:any,index:any)=>{
          $(`input[name=${getdat.label}][value=${getdat.value}]`).prop("checked",true)
          formik.setFieldValue(getdat.label, getdat.value)
        })
      }else {
        $(`input[class='form-check-input']`).removeAttr("checked");
      }
    })
  }

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
        <div className='form-group row'>
          <div className='col-lg-6 fv-row'>
                <label className='col-md-4 col-form-label fw-bold fs-6'>
                    <span className='required'>Role Name</span>
                </label>
                <select onChange={getRoleName}  id="role_name" name="role_name" className='form-select form-select-solid form-select-lg fw-bold'>
                    <option value=''>Role Name</option>
                    {
                      RoleNameDatas.map((res, index) => {
                        return (<option value={res._id} key={index}>{res.role_name}</option>)

                      })
                    }
                </select>
          </div>
        </div>

        <table id='kt_table_users' className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'>
                  <thead>
                    <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
                      <th>Permissions</th>
                      <th>Access</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-bold' >
                    {
                      RolesList.map((res: any, _inde: any) => {
                        return (
                          <tr>
                            <td >{res.label}</td>
                            <td >
                              {res.AttributesList.map((ress: any, index: any) => {

                                return <>
                                  <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="radio" {...formik.getFieldProps(res.value)} id={ress.label} value={ress.value} />
                                    <label className="form-check-label" htmlFor={ress.label}>{ress.label}</label>
                                  </div>

                                </>
                              })}

                            </td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>

        </div>
        

        
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
