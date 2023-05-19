import React, { useState, useEffect, FC, ChangeEvent } from 'react'
import { UserDetails, UserDetailsDetails as initialValues } from '../UserManagment/models/UserModels'
import * as Yup from 'yup'
import { useFormik, Field } from 'formik'
import axios from 'axios'
import { Theme, useTheme } from '@mui/material/styles';
import Select from 'react-select';
import swal from 'sweetalert';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};


function getStyles(name: string, personName: string[], theme: Theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}
const API_URL = process.env.REACT_APP_API_URL
export const REGISTER_URL = `/api/createuser/createUsers`
export function createUsers(updatedData: object) {
  return axios.post(REGISTER_URL, updatedData)
}

const pmsystemUrl = `/api/pmsystem/getPmList`
const getPracticeList = `/api/practice/getPracticeList`
const getUserList = `/users/getUsersList`
const getManagersList = `/users/getManagersList`
const getRoleList = `/api/roles/getRoleList`
const getPracticeListt = `/api/practice/getPracticeListByMultipleID`
const getUserById = `/users/getUserById`

const getPmList = `/api/pmsystem/getPmList`
const CreateUser: React.FC = () => {


  const theme = useTheme();
  const [personName, setPersonName] = React.useState<string[]>([]);
  const [practice_nameData, setpractice_nameData] = React.useState<string[]>([]);
  const [user_nameData, setuser_nameData] = React.useState<string[]>([]);
  const [data, setData] = useState<UserDetails>(initialValues)
  const [datas, setdatas] = useState([{ PmName: "", _id: "" }])
  const [PracticeNameDatas, setdPracticeNameDatas] = useState([{ PracticeName: "", _id: "" }])
  const [UserNameDatas, setUserNameDatas] = useState([{ FirstName: "", _id: "", LastName: "" }])
  const [ReportingManagerListData, setReportingManagerListData] = useState([{ FirstName: "", _id: "", LastName: "" }])
  
  const [RoleNameDatas, setRoleNameDatas] = useState([{ role_name: "", _id: "" }])
  const [SelectedPmSystem, setSelectedPmSystem] = useState([])
  const [SelectedPractice, setSelectedPractice] = useState([])
  const [SelectedUserName, setSelectedUserName] = useState({label:"",value:""})
  const [SelectedReportingManager, setSelectedReportingManager] = useState({label:"",value:""})
  
  const [PracticeListData, setPracticeListData] = useState([])

  const [SelectedValue, setSeSelectedValue] = React.useState({ label: "Select", value: "" })
  const [getPmListData, setdatass] = useState([{ PmName: "", _id: "" }])

  var PmListData: any = []
  getPmListData.map((name) => (
    PmListData.push({
      label: name.PmName,
      value: name._id
    })
  ))
  var UserOptions: any = []
  UserNameDatas.map((name) => (
    UserOptions.push({
      label: `${name.FirstName} ${name.LastName}`,
      value: name._id
    })
  ))
  var ReportingManagerList : any = []
  ReportingManagerListData.map((name) => (
    ReportingManagerList.push({
      label: `${name.FirstName} ${name.LastName}`,
      value: name._id
    })
  ))
  const GetPmList = async () => {
    const getPmListData = await axios.get(pmsystemUrl)
    if (getPmListData.data) {

      setdatass(getPmListData.data.data)
    }
  }
  const getPractice = (event: any) => {

    if (Object.keys(event).length > 0) {
      setSelectedPractice(event)


    } else {
      setSelectedPractice([])

    }

  }
  
  const getReportingManager = (event: any) => {
    setSelectedReportingManager(event)
  }
  const getUserName = async(event: any) => {

    setSelectedUserName(event)

    await axios.post(getUserById, { UserById: event.value }).then((res) => {

      console.log("res.data.data",res.data.data)
      if(res.data.ReportingManagerid){
        setSelectedReportingManager(res.data.ReportingManagerid)
      }else {
        setSelectedReportingManager({label:"",value:""})
      }
      if(res.data.SelectPMSystem.length > 0){
        setSelectedPmSystem(res.data.SelectPMSystem)
      }else {
        setSelectedPmSystem([])
      }
      if(res.data.SelectPracticeSystem.length > 0){
        setSelectedPractice(res.data.SelectPracticeSystem)
      }else {
        setSelectedPractice([])
      }
      // if(res.data.data.length > 0){
      //   res.data.data.PermissionsList.map((getdat:any,index:any)=>{
      //     $(`input[name=${getdat.label}][value=${getdat.value}]`).prop("checked",true)
      //     formik.setFieldValue(getdat.label, getdat.value)
      //   })
      // }else {
      //   $(`input[class='form-check-input']`).removeAttr("checked");
      // }
    })
  }
  const getPMSystem = (event: any) => {
    console.log("event", event)
    // setSelectedPractice([])
    setSelectedPmSystem(event)
    if (Object.keys(event).length > 0) {
      axios.post(getPracticeListt, { PostData: JSON.stringify(event) }).then((res) => {
        setPracticeListData(res.data.data)
      })
    }

  };


  const getdata = async () => {

    const Result = await axios.get(getUserList)
    if (Result.data) {

      setUserNameDatas(Result.data.data)
    }
    const ResultManagerData = await axios.get(getManagersList)
    if (ResultManagerData.data) {
      setReportingManagerListData(ResultManagerData.data.data)
    }
  }
  useEffect(() => {
    GetPmList()
    gettdata();
    getdata();
  }, [])

  const gettdata = async () => {

    const Result = await axios.get(getRoleList)
    if (Result.data) {

      setRoleNameDatas(Result.data.data)
    }
  }

  const Getdata = async () => {

    const Result = await axios.get(pmsystemUrl)
    if (Result.data) {

      setdatas(Result.data.data)
    }
  }

  const UserDetailsSchema = Yup.object().shape({
    // EmployeeId: Yup.object().shape({
    //   value: Yup.string().required(),
    //   // etc
    // }),
    // EmployeeId: Yup.string().required('Employee Id is required'),
    // role: Yup.string().required('Role is required'),
    // prefix: Yup.string().required('Prefix is required'),
    //reporting_manager: Yup.string().required('Report Manager is required'),
    // first_name: Yup.string().required('First Name is required'),
    // pm_system: Yup.array().required('PM system is required'),
    // practice_name: Yup.array().required('Practice Name is required'),
    // contact_number: Yup.string().required('Contact Number is required'),
  })
  const [loading, setLoading] = useState(false)
  // const[datas , setdatas]= useState([{UserName :""}])
  const formik = useFormik<UserDetails>({
    initialValues,
    validationSchema: UserDetailsSchema,

    onSubmit: async (values) => {
      console.log("values", values)
      
      // const updatedData = Object.assign(data, values)
      // setData(updatedData)
      var pm_system : any = []
      var practice_name : any = []
      SelectedPmSystem.map((res:any,ind)=>{
        pm_system.push(res.value)
      })
      SelectedPractice.map((res:any,ind)=>{
        practice_name.push(res.value)
      })

      if(!SelectedUserName.value){
        swal({
          title: 'Required',
          text: `Please Select User Name`,
          icon: "error",
        })
        return false;
      }
      if(!SelectedReportingManager.value){
        swal({
          title: 'Required',
          text: `Please Select Reporting Manager`,
          icon: "error",
        })
        return false;
      }

      if(pm_system.length == 0){
        swal({
          title: 'Required',
          text: `Please Select PM System`,
          icon: "error",
        })
        return false;
      }
      if(practice_name.length == 0){
        swal({
          title: 'Required',
          text: `Please Select Practice Name`,
          icon: "error",
        })
        return false;
      }
      setLoading(true)
      var PostData = {
        UserId: SelectedUserName.value,
        reporting_manager: SelectedReportingManager.value,
        pm_system : JSON.stringify(pm_system),
        practice_name: JSON.stringify(practice_name),
      }
      const { data: auth } = await createUsers(PostData)

      setLoading(false)

    },

  })
  
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
            <h3 className='fw-bolder m-0'>Create User</h3>
          </div>
        </div>

        <div id='kt_account_profile_details' className='collapse show'>
          <form onSubmit={formik.handleSubmit} noValidate className='form'>
            <div className='card-body border-top p-9'>
              <div className='form-group row'>
                <div className='col-lg-6 fv-row'>
                  <label className='col-lg-4 col-form-label required fw-bold fs-6'>User Name</label>

                  <Select maxMenuHeight={180} {...formik.getFieldProps('EmployeeId')} value={SelectedUserName} onChange={getUserName} id="EmployeeId" name={"EmployeeId"} options={UserOptions} />

                </div>
                
                <div className='col-lg-6 fv-row'>
                  <label className='col-lg-8 col-form-label fw-bold fs-6'>
                    <span className='required'>Reporting Manager</span>
                  </label>

                  <Select maxMenuHeight={180} {...formik.getFieldProps('reporting_manager')} value={SelectedReportingManager} onChange={getReportingManager} id="reporting_manager" name={"reporting_manager"} options={ReportingManagerList} />

                </div>


                <div className='col-lg-6 fv-row'>
                  <label className='col-lg-4 col-form-label fw-bold fs-6'>
                    <span className='required'>PM System</span>
                  </label>
                  <Select maxMenuHeight={180} value={SelectedPmSystem} isMulti onChange={getPMSystem} id="pm_system" name={"pm_system"} options={PmListData} />

                </div>
                <div className='col-lg-6 fv-row'>
                  <label className='col-lg-4 col-form-label fw-bold fs-6'>
                    <span className='required'>Practice Name</span>
                  </label>
                  <Select maxMenuHeight={180} value={SelectedPractice} isMulti onChange={getPractice} id="practice_name" name={"practice_name"} options={PracticeListData} />

                </div>


              </div>

              <div className='card-footer d-flex justify-content-end py-6 px-9'>
                <button type='submit' className='btn btn-primary' disabled={loading}>
                  {!loading && 'Save Changes'}
                  {loading && (
                    <span className='indicator-progress' style={{ display: 'block' }}>
                      Please wait...{' '}
                      <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                    </span>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}

export { CreateUser }