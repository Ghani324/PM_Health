import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { toAbsoluteUrl } from '../../../_metronic/helpers'
import { PageTitle } from '../../../_metronic/layout/core'
import axios from "axios";
import { useAuth } from '../../../app/modules/auth'
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
const getPracticeDashboard = `/api/PracticeSummary/getPracticeDashboard`



const DashboardWrapper: React.FC = () => {
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
  const [open, setOpen] = React.useState(false);
  const FilterDataList = async () => {

    setOpen(true)
    axios.get(`${getPracticeDashboard}?FromDate=${DateMonthFrom}&ToDate=${DateMonthTo}&PracticeName=${SelectedPracticeList.length > 0 ? JSON.stringify(SelectedPracticeList) : ""}`).then(_res => {
      setOpen(false)
      setPieChartData(_res.data.data)
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
    if (!DateMonthTo) {
      swal({
        title: 'Date',
        icon: "info",
        text: `Please choose To Date`,
      }).then((_res: any) => {

      })
      return false;
    }
    
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
            <h3 className='fw-bolder m-0'>Practice Summary  - YTD</h3>
          </div>
        </div>
        <hr />
        <div className='row'>
          
            <>
              <div className='col-sm-4 fv-row'>
                <label className='col-lg-6 col-form-label fw-bold fs-6'>
                  <span className='required'>From Month Year</span>
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
                  <span className='required'>To Month Year</span>
                </label><br />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    views={['year', 'month']}
                    onChange={handleDateChangeTo}
                  />
                </LocalizationProvider>
              </div>
              <div className='col-sm-4 fv-row'>
                <label className='col-lg-6 col-form-label fw-bold fs-6'>
                  <span className=''>Practice List</span>
                </label>

                <Select maxMenuHeight={180} value={SelectedPracticeList} isMulti onChange={getSelectedPractice} id="Practice" name={"Practice"} options={UsersListData} />

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

        <div className='row'>
          <div className='col-12'>
          {PieChartData.length > 0 ? 
            <Chart chartType="ColumnChart" data={PieChartData} options={{
              colors: ['#b2e2fd'],
              animation: {
                duration: 1500,
                startup: true
              },
              is3D: true,
              title: 'Charges & Payments',
            }} width={"100%"} height={"400px"} />: null}
            {/* {PieChartData.length > 0 ? 

            <Chart chartType="ColumnChart" data={PieChartData} options={{ title: "Charges & Payments", is3D: true, }} width={"100%"} height={"200px"} /> 
            
            : null} */}
            <div className="card shadow-sm">
              {/* <div className="card-header">
                <h3 className="card-title">Title</h3>
              </div> */}
              <div className="card-body">
                <ul>
                  <li>Total  Charges Submitted from February’22-February’23 for $xxM and Payments Received  for the Amount of $xx</li>
                  <li>Gross Collection Ratio (GCR) stands at xx% as of February’2023 in comparison with Monthly collections and charges</li>
                  <li>Total Charges Billed for the Month of February’23 $xx, and Payments Received $xx, GCR Stands at xx% </li>
                </ul>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  )
}
export { DashboardWrapper }