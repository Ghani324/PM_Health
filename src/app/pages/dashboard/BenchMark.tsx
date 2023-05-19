import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { toAbsoluteUrl } from '../../../_metronic/helpers'
import { PageTitle } from '../../../_metronic/layout/core'
import axios from "axios";
import { useAuth } from '../../modules/auth'
import { Chart } from "react-google-charts";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import Select from 'react-select';
import swal from "sweetalert"
import moment from "moment";
const getPracticeName = `/api/PracticeSummary/getPracticeName`
const getDaysinAr = `/api/PracticeSummary/getDaysinAr`
const getBenchMark = `/api/DenialReports/getBenchMark`
const options = { style: 'currency', currency: 'USD' };


const BenchMark: React.FC = () => {
  const intl = useIntl()
  const navigate = useNavigate();
  const location = useLocation();
  const userDetails: any = location.state;
  const { currentUser }: any = useAuth()
  const [UserNameDatas, setUserNameDatas] = useState([{ value: "", label: "" }])
  const [DateMonthFrom, setDateMonthFrom] = useState("")
  const [DateMonthTo, setDateMonthTo] = useState("")
  const [SelectedManager, setSelectedManager] = useState({ value: "", label: "" })
  const [SelectedPracticeList, setSelectedPracticeList] = useState([])
  const [PieChartData, setPieChartData] = useState([])
const [BenchMarkTable,setBenchMarkTable]=useState<any>([])
const [BenchMarkChart,setBenchMarkChart]=useState<any>([])
  const [open, setOpen] = React.useState(false);



  const FilterDataList = async () => {

    setOpen(true)
    axios.get(`${getBenchMark}?ChooseDate=${DateMonthFrom}&PracticeName=${Object.keys(SelectedPracticeList).length > 0 ? JSON.stringify(SelectedPracticeList) : ""}`).then(_res => {
      setOpen(false)
    console.log("_res.data.BenchMarkTable",_res.data.BenchMarkTable)
      setBenchMarkTable(_res.data.BenchMarkTable)
      console.log("BenchMarkChart",_res.data.BenchMarkChart)
      setBenchMarkChart(_res.data.BenchMarkChart)
    })


  }

  const getSelectedPractice = (event: any) => {
    setSelectedPracticeList(event)
  }
  
  const handleDateChangeFrom = (date: any) => {
    setDateMonthFrom(moment(date['$d']).format("MMM-YYYY"))
  };
  const handleDateChangeTo = (date: any) => {
    setDateMonthTo(moment(date['$d']).format("MMM-YYYY"))
  };

  const Filter = async (ids: any) => {

    if (!DateMonthFrom) {
      swal({
        title: 'Date',
        icon: "info",
        text: `Please choose From Date`,
      }).then((_res: any) => {

      })
      return false;
    }
    // if (!DateMonthTo) {
    //   swal({
    //     title: 'Date',
    //     icon: "info",
    //     text: `Please choose To Date`,
    //   }).then((_res: any) => {

    //   })
    //   return false;
    // }
    
    FilterDataList()
  }
  const ClearFilter = async (ids: any) => {

    setDateMonthFrom("")
    setDateMonthTo("")
    setSelectedPracticeList([])
    setPieChartData([])

  }
  const getPracticeNameata = async () => {
    const Result = await axios.get(getPracticeName)
    setUserNameDatas(Result.data.PracticeData)
  }
  useEffect(() => {
    getPracticeNameata()
  }, [])
  var UsersListData: any = []
  UserNameDatas.map((practiceList: any, index) => {
    UsersListData.push({
      label: practiceList.practice_name,
      value: practiceList.practice_name
    })
  })


  return (
    <>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      // onClick={handleClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <PageTitle breadcrumbs={[]}>{intl.formatMessage({ id: 'MENU.DASHBOARD' })}</PageTitle>
      <div >
        <div
          className='card-header border-0 cursor-pointer'
          role='button'
          data-bs-toggle='collapse'
          data-bs-target='#kt_account_profile_details'
          aria-expanded='true'
          aria-controls='kt_account_profile_details'
        >
          <div className='card-title m-0'>
            <h3 className='fw-bolder m-0'>Benchmarking Against Industry Standards</h3>
          </div>
        </div>
        <hr />
        <div className='row'>
          
            <>
              <div className='col-sm-4 fv-row'>
                <label className='col-lg-6 col-form-label fw-bold fs-6'>
                  <span className='required'>Choose Month Year</span>
                </label><br />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    views={['year', 'month']}
                    onChange={handleDateChangeFrom}
                  />
                </LocalizationProvider>
              </div>
            
              <div className='col-sm-4 fv-row'>
                <label className='col-lg-6 col-form-label fw-bold fs-6'>
                  <span className=''>Practice List</span>
                </label>

                <Select maxMenuHeight={180} value={SelectedPracticeList}  onChange={getSelectedPractice} id="Practice" name={"Practice"} options={UsersListData} />

              </div></>
          <div className='col-1 pt-13'>
            <button onClick={(e) => { Filter(e) }} className='btn btn-primary'  >Filter</button>
          </div>
          <div className='col-1 pt-13'>
            <button onClick={(e) => { ClearFilter(e) }} className='btn btn-primary'  >Clear</button>
          </div>
          {/* <div className='col-1 pt-13'>
            <a onClick={(e) => { DownloadFile(e) }} href={`/users/DownloadDashboard?ManagerID=${Object.keys(SelectedManager).length > 0 ? SelectedManager.value : ""}&UserId=${JSON.stringify(SelectedPracticeList)}&FromDate=${formData.FromDate}&ToDate=${formData.ToDate}`} className='btn btn-primary'>Download</a>
          </div> */}

        </div><hr />
<div className='d-flex'>
<div className='w-50 shadow rounded-lg mx-4'>
          {BenchMarkChart.length > 0 ? 
            <Chart chartType="ColumnChart" data={BenchMarkChart} options={{
              animation: {
                duration: 1500,
                startup: true
              },
              is3D: true,
              title: 'Charges and Collections By Location',
            }} width={"100%"} height={"400px"} />: null}
         
            </div>
      
<div className='w-50 d-flex items-center justify-content-center mt-10'>
            <div>
            {BenchMarkTable.length > 0 ? (
              <table  id='kt_table_users'
              className='table-bordered align-middle fs-6 p-4  font-family-base no-footer col-12 h-full '>
                <thead>
                  <tr>
                  <th className='text-center p-2'>Category</th>
                    <th className='text-center p-2'>BenchMark</th>
                    <th className='text-center p-2'>DM Achieved</th>
                   
                    {/* <th className='text-center p-2'>Month</th>
                    <th className='text-center p-2'>Charge Lag</th>
                    <th className='text-center p-2'>NCR</th>
                    <th className='text-center p-2'>Denial Rate</th>
                    <th className='text-center p-2'>Clean Claim Rate</th>
                    <th className='text-center p-2'>AR Days Above 90</th>
                    <th className='text-center p-2'>AR Days Above 120</th> */}
                  </tr>
                </thead>
                <tbody>
                  {BenchMarkTable.map((res:any,ind:any)=>{
                    return (
                        <>
                      <tr>
                       <th className='text-center p-2'>Charge Lag</th>
                       <td className='px-3 py-2 text-center'>40 days</td>
                       <td className='px-3 py-2 text-center'>{res.ArDataDemo ? res.ArDataDemo +" " + "days" : "None"}</td> 
                   </tr>
                    <tr>
                    <th className='text-center p-2'>NCR</th>
                    <td className='px-3 py-2 text-center'>47%</td>
                    <td className='px-3 py-2 text-center'>{res.NcrData ? res.NcrData+" "+"%" : "None"}</td>  
                </tr>
                <tr>
                    <th className='text-center p-2'>Clean Claim Rate</th>
                    <td className='px-3 py-2 text-center'>95%</td>
                    <td className='px-3 py-2 text-center'>{res.Clean_Claim_Rate ? res.Clean_Claim_Rate+" "+"%" : "None"}</td>  
                </tr>
                <tr>
                    <th className='text-center p-2'>Denial Rate</th>
                    <td className='px-3 py-2 text-center'>5%</td>
                    <td className='px-3 py-2 text-center'>{res.Denial_Rate ? res.Denial_Rate+" "+"%" : "None"}</td>  
                </tr>
                <tr>
                    <th className='text-center p-2'>AR 120+</th>
                    <td className='px-3 py-2 text-center'>15%</td>
                    <td className='px-3 py-2 text-center'>{res.Final120Rate ? res.Final120Rate+" "+"%" : "None"}</td>  
                </tr>
                <tr>
                    <th className='text-center p-2'>AR 90+</th>
                    <td className='px-3 py-2 text-center'>25%</td>
                    <td className='px-3 py-2 text-center'>{res.Final90Rate ? res.Final90Rate+" "+"%" : "None"}</td>  
                </tr>
                <tr>
                    <th className='text-center p-2'>GCR</th>
                    <td className='px-3 py-2 text-center'>47%</td>
                    <td className='px-3 py-2 text-center'>{res.TotalGCR ? res.TotalGCR+" "+"%" : "None"}</td>  
                </tr>
                <tr>
                   
                </tr>
                </>
                    )
                  })}
                </tbody>
              </table>
            ) : null}
          </div>
          </div>
          </div>
      </div>
    </>
  )
}
export { BenchMark }