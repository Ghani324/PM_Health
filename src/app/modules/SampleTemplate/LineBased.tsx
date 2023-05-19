import React, { useState, useEffect, FC, ChangeEvent } from 'react'
import { UserDetails, UserDetailsDetails as initialValues } from '../SampleTemplate/models/template'
import * as Yup from 'yup'
import { useFormik, Field } from 'formik'

import axios from 'axios'
import Select from 'react-select';


const API_URL = process.env.REACT_APP_THEME_API_URL

const pmsystemUrl = `/api/pmsystem/getLineBasedPmList`
const getPracticeListt = `/api/practice/getPracticeListById`

const LineBased: React.FC = () => {


  const [data, setData] = useState<UserDetails>(initialValues)
  const [SelectedPmSystem, setSelectedPmSystem] = useState({})
  const [SelectedPractice, setSelectedPractice] = useState({ label: "", value: "" })
  const [PracticeListData, setPracticeListData] = useState([])
  const [getPmListData, setdatass] = useState([{ PmName: "", _id: "" }])

  useEffect(() => {
    GetPmList()
  },[])
  const GetPmList = async () => {
    const getPmListData = await axios.get(pmsystemUrl)
    if (getPmListData.data) {

      setdatass(getPmListData.data.data)
    }
  }
  const DownloadFile = async (e:any)=>{
    e.preventDefault();
    await axios.get(e.target.href,{responseType: 'arraybuffer',}).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `SampleTemplate_${SelectedPractice.label}.xlsx`);
        document.body.appendChild(link);
        link.click();
    }).catch((error) => console.log(error));
    return false;
}
  const getPractice = (event: any) => {

    if (Object.keys(event).length > 0) {
      setSelectedPractice(event)
    } else {
      setSelectedPractice({ label: "", value: "" })
    }

  }
  const getPMSystem = (event: any) => {
    setSelectedPmSystem(event)
    if (event.value) {
      axios.post(getPracticeListt, { PostData: event.value }).then((res) => {
        setPracticeListData(res.data.data)
      })
    }

  };
  var PmListData = [{ label: "Select", value: "" }]
  getPmListData.map((name) => (
    PmListData.push({
      label: name.PmName,
      value: name._id
    })
  ))

 

  const UserDetailsSchema = Yup.object().shape({

    pm_system: Yup.array().required('PM system is required'),
    practice_name: Yup.array().required('Practice Name is required'),

  })
  const [loading, setLoading] = useState(false)
  const formik = useFormik<UserDetails>({
    initialValues,
    validationSchema: UserDetailsSchema,

    onSubmit: async (values) => {
      console.log("values", values)
      setLoading(true)
      const updatedData = Object.assign(data, values)
      setData(updatedData)

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
            <h3 className='fw-bolder m-0'>Line Based</h3>
          </div>
        </div>

        <div id='kt_account_profile_details' className='collapse show'>
          <form onSubmit={formik.handleSubmit} noValidate className='form'>
            <div className='card-body border-top p-9'>
              <div className='form-group row'>


                <div className='col-sm-4 fv-row'>
                  <label className='col-lg-4 col-form-label fw-bold fs-6'>
                    <span className='required'>PM System</span>
                  </label><br />
                  <Select maxMenuHeight={180} value={SelectedPmSystem} onChange={getPMSystem} id="pm_system" name={"pm_system"} options={PmListData} />

                  {formik.touched.pm_system && formik.errors.pm_system && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>{formik.errors.pm_system}</div>
                    </div>
                  )}
                </div>
                <div className='col-sm-4 fv-row'>
                  <label className='col-lg-6 col-form-label fw-bold fs-6'>
                    <span className='required'>Practice Name</span>
                  </label>
                  <br />
                  <Select maxMenuHeight={180} value={SelectedPractice} onChange={getPractice} id="practice_name" name={"practice_name"} options={PracticeListData} />

                  {formik.touched.practice_name && formik.errors.practice_name && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>{formik.errors.practice_name}</div>
                    </div>
                  )}
                </div>
                <div className='col-lg-4 fv-row'>
                  <br /><br />
                  {SelectedPractice.value ? <a onClick={(e) => { DownloadFile(e) }} href={`/api/practice/templateDownlaod?practice_id=` + SelectedPractice.value} className='btn btn-lg btn-primary me-3'>
                    Download
                  </a> : null}
                  

                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export { LineBased }