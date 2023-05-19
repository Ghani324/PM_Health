import React, { useState, useEffect, FC, ChangeEvent } from 'react'
import { RoleDetails, RoleDetailsDetails as initialValues } from '../rolemanagement/models/RoleModels'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import axios from 'axios'
import swal from "sweetalert"
import $ from "jquery";
const API_URL = process.env.REACT_APP_API_URL
export const REGISTER_URL = `/api/roles/createRole`
const getRoleList = `/api/roles/getRoleList`
const getPermissionRoleList = `/users/getPermissionRoleList`
const getRoleByid = `/api/roles/getRoleByid`
export function createRole(updatedData: object) {
  return axios.post(REGISTER_URL, updatedData)
}


const CreateRole: React.FC = () => {


  const [data, setData] = useState<RoleDetails>(initialValues)
  const [RoleNameDatas, setRoleNameDatas] = useState([{ role_name: "", _id: "" }])
  const [RolesList, setRolesList] = useState([])

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
  }, [])
  const UserDetailsSchema = Yup.object().shape({
    role_name: Yup.string().required('Role Name is required'),
    UserManagement: Yup.string().required('User Management is required'),
    UploadClaims: Yup.string().required('Upload Claims is required'),
    ViewClaims: Yup.string().required('View Claims is required'),
    ViewMyClaims: Yup.string().required('View My Claims is required'),
    AddNewPM: Yup.string().required('Add New PM is required'),
    AddNewPractice: Yup.string().required('Add New Practice is required'),
    ARCommentHistory: Yup.string().required('AR Comment History is required'),
    AssignClaim: Yup.string().required('Assign Claim is required'),
    ReportCTR: Yup.string().required('Report Report Call time Report	 is required'),
    ReportTPD: Yup.string().required('ReportReport Team Productivity Dashboard	 is required'),
    BotCSC: Yup.string().required('Bot Bot / API Claim Status check	 is required'),
    ReportPCA: Yup.string().required('Report P C A is required')

  })

  const formik = useFormik<RoleDetails>({
    initialValues,
    validationSchema: UserDetailsSchema,
    onSubmit: async (values) => {
      console.log("values", JSON.stringify(values))
      setLoading(true)
      // const updatedData = Object.assign(data, values)
      // setData(updatedData)
      const ResultData = await createRole(values)
      if (ResultData.data.Result) {
        setLoading(false)
        swal({
          title: 'Done',
          icon: "success",
          text: `Permission Created Successfully...!`,
        }).then((_res: any) => {

        })
      }else {
        setLoading(false)
      }
    },
  })

  const [loading, setLoading] = useState(false)
  const getRoleName = async(event: any) => {
    formik.setFieldValue("role_name", event.target.value)
    await axios.post(getRoleByid, { RoleId: event.target.value }).then((res) => {
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
  
  var error: any = formik
  return (
    <>

      <div className='card mb-5 mb-xl-10'>
        <div
          className='card-header border-0 cursor-pointer'
          role='button'
          data-bs-toggle='collapse'
          data-bs-target='#kt_account_profile_details'
          aria-expanded='true'
          aria-controls='kt_account_profile_details'
        >
          <div className='card-title m-0'>
            <h3 className='fw-bolder m-0'>Role Permissions</h3>
          </div>
        </div>
        {/* <h2 className='text-center'>Comming Soon ...!</h2> */}
        <div id='kt_account_profile_details' className='collapse show'>
          <form onSubmit={formik.handleSubmit} className='form'>
            <div className='card-body border-top p-9'>
              <div className='form-group row'>

                <div className='col-lg-6 fv-row'>
                  <label className='col-lg-4 col-form-label fw-bold fs-6'>
                    <span className='required'>Role Name</span>
                  </label>
                  <select onChange={getRoleName} id="role_name" name="role_name" className='form-select form-select-solid form-select-lg fw-bold'>
                    <option value=''>Role Name</option>
                    {
                      RoleNameDatas.map((res, index) => {
                        return (<option value={res._id} key={index}>{res.role_name}</option>)

                      })
                    }
                  </select>
                  <br />
                  {formik.touched.role_name && formik.errors.role_name && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>{formik.errors.role_name}</div>
                    </div>
                  )}
                </div>
                <hr />
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
                              {error.touched[res.value] && error.errors[res.value] && (
                                <div className='fv-plugins-message-container'>
                                  <div className='fv-help-block'>{error.errors[res.value]}</div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
              {formik.values.role_name ? 
              <div className='card-footer d-flex justify-content-end py-6 px-9'>
                <button type='submit' className='btn btn-primary' >
                  {!loading && 'Save Changes'}
                  {loading && (
                    <span className='indicator-progress' style={{ display: 'block' }}>
                      Please wait...{' '}
                      <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                    </span>
                  )}
                </button>
              </div> : null }
            </div>

          </form>
        </div>
      </div>
    </>
  )
}

export { CreateRole }
