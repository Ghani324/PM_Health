import React, { useState, useEffect,HTMLAttributes } from 'react'
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
import { table } from 'console';



const getPracticeName = `/api/PracticeSummary/getPracticeName`
const getCleanClaimRatio = `/api/DenialReports/getCleanClaimRatio`
const options = { style: 'currency', currency: 'USD' };


const CleanClaimRatio: React.FC = () => {
  const intl = useIntl()

   const { currentUser }: any = useAuth()
  const [UserNameDatas, setUserNameDatas] = useState([{ value: "", label: "" }])
  const [DateMonthFrom, setDateMonthFrom] = useState("")
  const [DateMonthTo, setDateMonthTo] = useState("")
  const [SelectedPracticeList, setSelectedPracticeList] = useState([])
  const [PieChartData, setPieChartData] = useState([])
  const [open, setOpen] = React.useState(false);
const[RejectRateTable,setRejectRateTable]=useState<any>([])



  const FilterDataList = async () => {

    setOpen(true)
    axios.get(`${getCleanClaimRatio}?FromDate=${DateMonthFrom}&ToDate=${DateMonthTo}&PracticeName=${SelectedPracticeList.length > 0 ? JSON.stringify(SelectedPracticeList) : ""}`).then(_res => {
      setOpen(false)
      setPieChartData(_res.data.data)
      setRejectRateTable(_res.data.table)
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
        sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
        open={open}
        // onClick={handleClose}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
      <PageTitle breadcrumbs={[]}>{intl.formatMessage({id: 'MENU.DASHBOARD'})}</PageTitle>
      <div>
        <div
          className='card-header border-0 cursor-pointer'
          role='button'
          data-bs-toggle='collapse'
          data-bs-target='#kt_account_profile_details'
          aria-expanded='true'
          aria-controls='kt_account_profile_details'
        >
          <div className='card-title m-0'>
            <h3 className='fw-bolder m-0'>KPI's - Clean Claim Rate</h3>
          </div>
        </div>
        <hr />
        <div className='row'>
          {currentUser.RoleType !== 'AR-Caller' ? (
            <>
              <div className='col-sm-4 fv-row'>
                <label className='col-lg-6 col-form-label fw-bold fs-6'>
                  <span className='required'>From Month Year</span>
                </label>
                <br />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker views={['year', 'month']} onChange={handleDateChangeFrom} />
                </LocalizationProvider>
              </div>
              <div className='col-sm-4 fv-row'>
                <label className='col-lg-6 col-form-label fw-bold fs-6'>
                  <span className='required'>To Month Year</span>
                </label>
                <br />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker views={['year', 'month']} onChange={handleDateChangeTo} />
                </LocalizationProvider>
              </div>
              <div className='col-sm-4 fv-row'>
                <label className='col-lg-6 col-form-label fw-bold fs-6'>
                  <span className=''>Practice List</span>
                </label>

                <Select
                  maxMenuHeight={180}
                  value={SelectedPracticeList}
                  isMulti
                  onChange={getSelectedPractice}
                  id='Practice'
                  name={'Practice'}
                  options={UsersListData}
                />
              </div>
            </>
          ) : null}
          <div className='col-1 pt-13'>
            <button
              onClick={(e) => {
                Filter(e)
              }}
              className='btn btn-primary'
            >
              Filter
            </button>
          </div>
          <div className='col-1 pt-13'>
            <button
              onClick={(e) => {
                ClearFilter(e)
              }}
              className='btn btn-primary'
            >
              Clear
            </button>
          </div>
          {/* <div className='col-1 pt-13'>
            <a onClick={(e) => { DownloadFile(e) }} href={`/users/DownloadDashboard?ManagerID=${Object.keys(SelectedManager).length > 0 ? SelectedManager.value : ""}&UserId=${JSON.stringify(SelectedPracticeList)}&FromDate=${formData.FromDate}&ToDate=${formData.ToDate}`} className='btn btn-primary'>Download</a>
          </div> */}
        </div>
        <hr />

        <div className='d-flex'>
          <div className='w-50 shadow rounded-lg'>
            {PieChartData.length > 0 ? (
              <Chart
                chartType='ColumnChart'
                data={PieChartData}
                options={{
                  colors: ['#b2e2fd'],
                  animation: {
                    duration: 1500,
                    startup: true,
                  },
                  vAxis: {
                    title: 'Percentage',
                },
                hAxis: {
                    title: 'Clean Claim Rate',
                    
                },
                  is3D: true,
                  title: 'Month & Clean Claim Ratio',
                }}
                width={'100%'}
                height={'400px'}
              />
            ) : null}
          </div>
          {/* Table */}
          <div className='w-50 shadow rounded-lg mx-4'>
            {RejectRateTable.length > 0 ? (
              <table  id='kt_table_users'
              className=' table-bordered align-middle fs-6 p-4  font-family-base no-footer col-12 '>
                <thead>
                  <tr>
                    <th className='text-center p-2'>Month</th>
                    <th className='text-center p-2'>Total Charges</th>
                    <th className='text-center p-2'>Clean Claim</th>
                    <th className='text-center p-2'>Clean Claim Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {RejectRateTable.map((res:any,ind:any)=>{
                    return (
                      <tr>
                      <td className='px-3 py-2 text-center'>{res.Month_Wise ? res.Month_Wise : "None"}</td>
                      <td className='px-3 py-2 text-center'>{res.Total_Charges ? res.Total_Charges.toLocaleString('en-US', options) : "None"}</td>
                      <td className='px-3 py-2 text-center'>{res.Clean_Claim ? res.Clean_Claim.toLocaleString('en-US', options) : "None"}</td>
                      <td className='px-3 py-2 text-center'>{res.Clean_Claim_Rate ? res.Clean_Claim_Rate : "-"}</td>
                   </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : null}
          </div>


        </div>
      </div>
    </>
  )
}
export { CleanClaimRatio }