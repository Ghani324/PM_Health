import React, { FC, useState, useEffect, HtmlHTMLAttributes } from 'react'
import * as Yup from 'yup'
import { useFormik, useField } from 'formik'
import { isNotEmpty, toAbsoluteUrl } from '../../../../../_metronic/helpers'
import { initialUser, User } from '../core/_models'
import clsx from 'clsx'
import Select from 'react-select';
import { useListView } from '../core/ListViewProvider'
import { UsersListLoading } from '../components/loading/UsersListLoading'
import { createUser, deleteUser } from '../core/_requests'
import { useQueryResponse } from '../core/QueryResponseProvider'
import axios from 'axios'
import swal from 'sweetalert';
const API_URL = process.env.REACT_APP_THEME_API_URL
const pmsystemUrl = `/api/pmsystem/getPmList`
const getPracticeList = `/api/practice/getPracticeList`
const getPracticeListt = `/api/practice/getPracticeListById`

const getpracticeByName = `/api/practice/getpracticeByName`

type Props = {
  isUserLoading: boolean
  user: User,
}

const editUserSchema = Yup.object().shape({
  PracticeName: Yup.string().required('Practice Name is required'),
  PmId: Yup.string().required('PM System is required')
})


const UserEditModalForm: FC<Props> = ({ user, isUserLoading, }) => {
  const { setItemIdForUpdate } = useListView()

  const { refetch } = useQueryResponse()
  const [userForEdit] = useState<User>({
    ...user,
    PracticeName: user.PracticeName || initialUser.PracticeName,
    PmId: user.PmId || initialUser.PmId,
    DisplayNames: user.DisplayNames || initialUser.DisplayNames,
    ClaimColumns: user.DisplayNames || [],
  })
  const [show, setShow] = useState(true);

  const [datas, setdatas] = useState([{ PmName: "", _id: "" }])
  const [setClaimDataFieldsList, setClaimDataFields] = useState()
  const [ClaimColumns, SelectedFieldsNamesList] = useState([{}])
  const [PracticeNameDatas, setdPracticeNameDatas] = useState([{ PracticeName: "", _id: "" }])
  const [SelectedPmSystem, setSelectedPmSystem] = useState({})
  const [SelectedPractice, setSelectedPractice] = useState({ label: "", value: "" })
  const [PracticeListData, setPracticeListData] = useState([])
  const [SelectedValue, setSeSelectedValue] = React.useState({ label: "Select", value: "" })
  const [getPmListData, setdatass] = useState([{ PmName: "", _id: "" }])


  const GetPmList = async () => {
    const getPmListData = await axios.get(pmsystemUrl)
    if (getPmListData.data) {

      setdatass(getPmListData.data.data)
    }
  }
  useEffect(() => {
    GetPmList()

  }, [])
  const getPractice = (event: any) => {

    if (Object.keys(event).length > 0) {
      setSelectedPractice(event)


    } else {
      setSelectedPractice({ label: "", value: "" })

    }

  }
  
  const getPMSystem = (event: any) => {
    //setSelectedPractice([])
    setSelectedPmSystem(event)
    if (!event.value) {
      formik.setFieldError("PmId", "PM System is required")
    } else {
      formik.setFieldError("PmId", "")
    }
    formik.setFieldValue("PmId", event.value)
    formik.setFieldValue("PmName", event.label)
    const getPracticeList = `/api/Claims/GetClaimColumns`
    axios.post(getPracticeList, { PostData: event.value }).then((res) => {
      setClaimDataFields(res.data.Data)
    })



  };
  var PmListData = [{ label: "Select", value: "" }]
  getPmListData.map((name) => (
    PmListData.push({
      label: name.PmName,
      value: name._id
    })
  ))
  function changeState() {
    setShow(!show);
  }
  const handleClick = () => {
    alert('button click catched');
  };




  const cancel = (withRefresh?: boolean) => {
    if (withRefresh) {
      refetch()
    }

    setItemIdForUpdate(undefined)
  }
  const formik = useFormik({
    initialValues: userForEdit,
    validationSchema: editUserSchema,
    onSubmit: async (values, { setSubmitting }) => {
      console.log("values", values)
      setSubmitting(true)

      if(!values.id){
        const Result = await axios.get(`${getpracticeByName}?PracticeName=${values.PracticeName}`)
        if (Result.data.Response) {
          swal({
            title: "",
            text: `${values.PracticeName} Already Exists`,
            icon: "error",
          })
          setSubmitting(false)
          return false;
        }
      }
      try {
        var test: any
        test = await createUser(values)
        console.log("test", test.PracticeName)
        //}
      } catch (ex) {
        console.error(ex)
      } finally {

        if (values.id) {
          swal({
            title: 'Success',
            text: `${values.PracticeName} Updated Successfully...`,
            icon: "success",
          })
            .then((res: any) => {
              setSubmitting(true)
              cancel(true)
            })
        } else {
          swal({
            title: 'Success',
            text: `${values.PracticeName} Created Successfully...`,
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

  useEffect(() => {
    Getdata();
  }, [])

  const Getdata = async () => {
    if(user.id){
      setSelectedPmSystem({value:user.PmId,label:user.PmName})
    }
    const Result = await axios.get(pmsystemUrl)
    console.log("Result", Result.data)
    if (Result.data) {
      setdatas(Result.data.data)
    }

    if (user.id) {

      const getPracticeList = `/api/Claims/GetClaimColumns`
      axios.post(getPracticeList, { PostData: user.PmId }).then((res) => {
        setClaimDataFields(res.data.Data)
      })

      var data = user.DisplayNames || [{}]
      var ClaimColumnsDataFil = [{}]
      ClaimColumnsDataFil.slice(0)
      data.map((res: any) => {
        formik.setFieldValue(res.value, res.label)
        ClaimColumnsDataFil.push({
          label: res.value,
          value: res.value
        })
      })

      SelectedFieldsNamesList(data)
      formik.setFieldValue("ClaimColumns", ClaimColumnsDataFil)
    }
  }

  const handleChange = (event: { target: { value: any } }) => {
    if (!event.target.value) {
      formik.setFieldError("PmId", "PM System is required")
    } else {
      formik.setFieldError("PmId", "")
    }
    formik.setFieldValue("PmId", event.target.value)
    const getPracticeList = `/api/Claims/GetClaimColumns`
    axios.post(getPracticeList, { PostData: event.target.value }).then((res) => {
      setClaimDataFields(res.data.Data)
    })
  }
  const handleChangeMultiColumnMulti = (event: { target: { value: any, name: any } }) => {
    var name: any
    name = event.target.name
    var value = event.target.value
    var Data = { [name]: value }

    console.log("name", name, event.target.value)
    formik.setFieldValue(name, event.target.value)
  }

  const handleChangeMultiColumn = (e: any) => {
    SelectedFieldsNamesList(e)
    formik.setFieldValue("ClaimColumns", e)
  }
  console.log("formik.values", formik.values)
  return (
    <>
      <form id='kt_modal_add_user_form' className='form' onSubmit={formik.handleSubmit} noValidate>
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
          <div className='row'>
            <div className='col-6 fv-row mb-7'>
              <label className='col-lg-4 col-form-label fw-bold fs-6'>
                <span className='required'>PM System</span>
              </label>
              <Select maxMenuHeight={180} value={SelectedPmSystem} onChange={getPMSystem} id="PmId" name={"PmId"} options={PmListData} />


            </div>


            <div className='col-6 fv-row mb-7'>
              <label className='required col-lg-4 col-form-label fw-bold fs-6'>Practice Name</label>

              <input
                placeholder='Practice Name'
                {...formik.getFieldProps('PracticeName')}
                type='text'
                name='PracticeName'
                className={clsx(
                  'form-control form-control-solid mb-3 mb-lg-0',
                  { 'is-invalid': formik.touched.PracticeName && formik.errors.PracticeName },
                  {
                    'is-valid': formik.touched.PracticeName && !formik.errors.PracticeName,
                  }
                )}
                autoComplete='off'
                disabled={formik.isSubmitting || isUserLoading}
              />
              {formik.touched.PracticeName && formik.errors.PracticeName && (
                <div className='col-6  fv-plugins-message-container'>
                  <div className='fv-help-block'>
                    <span role='alert'>{formik.errors.PracticeName}</span>
                  </div>
                </div>
              )}
            </div>

            <div className='col-12 fv-row mb-7'>
              <label className='required col-lg-4 col-form-label fw-bold fs-6'>Claim Columns</label>


              <Select maxMenuHeight={180} defaultValue={formik.values.ClaimColumns} options={setClaimDataFieldsList} isMulti id="ClaimColumns" name="ClaimColumns" onChange={handleChangeMultiColumn} className="basic-multi-select" classNamePrefix="select" />

            </div>


            {/* <div className='col-6 fv-row mb-7'>
              <label className='required col-lg-4 col-form-label fw-bold fs-6'>Upload Sample Template</label>


              <input type="file" name="" />

            </div> */}
          </div>
        </div>
        <div>


          <table className="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer">
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Display Name</th>

              </tr>
            </thead>
            <tbody>
              {
                ClaimColumns.map((stationIndex: any) => {

                  if (stationIndex.value) {
                    if (stationIndex._id) {
                      return <tr className="form__table-row">
                        <td>{stationIndex.value}</td>
                        <td>

                          <input

                            required
                            placeholder='Alias Name'
                            onChange={handleChangeMultiColumnMulti}
                            type='text'
                            name={stationIndex.value}
                            value={stationIndex.label}
                            autoComplete='off'
                            className='form-control'
                          />
                        </td>
                      </tr>
                    } else {
                      return <tr className="form__table-row">
                        <td>{stationIndex.value}</td>
                        <td>

                          <input

                            required
                            placeholder='Alias Name'
                            onChange={handleChangeMultiColumnMulti}
                            type='text'
                            name={stationIndex.value}
                            //value={}
                            autoComplete='off'
                            className='form-control'
                          />
                        </td>
                      </tr>
                    }

                  }

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
      </form>
      {(formik.isSubmitting || isUserLoading) && <UsersListLoading />}
    </>
  )
}

export { UserEditModalForm }