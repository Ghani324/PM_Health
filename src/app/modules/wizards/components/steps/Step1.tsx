/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useState, useEffect } from 'react'
import {  ErrorMessage, useField } from 'formik'
import axios from 'axios'
import Select from 'react-select';
const API_URL = process.env.REACT_APP_THEME_API_URL
const pmsystemUrl = `/api/pmsystem/getPmList`

const Step1: FC = () => {
  const [datas, setdatas] = useState([{ PmName: "", _id: "" }])
  useEffect(() => {
    Getdata();
  }, [])
  const [FinalFormData,setFinalFormData] = useState()
  const Getdata = async () => {
    const Result = await axios.get(pmsystemUrl)
    if (Result.data) {
      setdatas(Result.data.data)
    }
  }

  const [field, meta, helpers] = useField("PmId");

  var PmList = [{ label: "Select", value: "" }]
  datas.map((res: any, index: any) => {
    PmList.push({
      label: res.PmName,
      value: res._id
    })
  })
  return (
    <div className='w-100'>
      <div className='pb-10 pb-lg-15'>
        <h2 className='fw-bolder d-flex align-items-center text-dark'>
          Choose PM System
          <i className='fas fa-exclamation-circle ms-2 fs-7' data-bs-toggle='tooltip' title='PM System'></i>
        </h2>
      </div>
      <div className='fv-row'>
        <div className='row'>
          <Select maxMenuHeight={180} name={"PmId"} value={field.value} onChange={(value) => helpers.setValue(value)} options={PmList}  />
          <div className='text-danger mt-2'>
            <ErrorMessage name='PmId' />
          </div>
        </div>
      </div>
    </div>
  )
}
export { Step1 }