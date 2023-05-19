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
const getArDetails = `/api/PracticeSummary/getArDetails`


const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
const ARDetails: React.FC = () => {
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
  const [TableData, setTableData] = useState([])
  const [open, setOpen] = React.useState(false);
  const FilterDataList = async () => {

    setOpen(true)
    axios.get(`${getArDetails}?FromDate=${DateMonthFrom}&ToDate=${DateMonthTo}&PracticeName=${Object.keys(SelectedPracticeList).length > 0 ? JSON.stringify(SelectedPracticeList) : ""}`).then(_res => {
      setOpen(false)
      setTableData(_res.data.Data)
    })


  }
  const getSelectedPractice = (event: any) => {
    console.log("event",event)
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
    setTableData([])

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
  var Result :any;
  console.log("TableData",TableData)
  var TotalAddressedCount : any = 0;
  var TotalAddressedAmount : any = 0;
  var TotalUnAddressedCount : any = 0;
  var TotalUnAddressedAmount : any = 0;

  var TotalClaimsLines : any = 0;
  var TotalClaimsAmount : any = 0;


  var GrnadTotalClaimsLines : any = 0;
  var GrandTotalClaimsAmount : any = 0;
  var FianlTotalClaimsAmount : any = 0;
  if(TableData.length > 0){

    TableData.map((res: any, _inde: any) => {
      GrandTotalClaimsAmount += Number(res.TouchedAmount) + Number(res.UnTouchedAmount);
      FianlTotalClaimsAmount += Number(GrandTotalClaimsAmount)
    })
    var FinalPercentage = Number(FianlTotalClaimsAmount / FianlTotalClaimsAmount * 100).toFixed(0)
    Result = TableData.map((res: any, _inde: any) => {
      TotalAddressedCount += Number(res.TouchedCount)
      TotalAddressedAmount += Number(res.TouchedAmount)
      TotalUnAddressedCount += Number(res.UnTouchedCount)
      TotalUnAddressedAmount += Number(res.UnTouchedAmount)


      TotalClaimsLines += Number(res.TouchedCount) + Number(res.UnTouchedCount)

      TotalClaimsAmount += Number(res.TouchedAmount) + Number(res.UnTouchedAmount)


      GrnadTotalClaimsLines += TotalClaimsLines;
      if(_inde == TableData.length - 1){

        return (
          <>
          
          <tr className='text-start  fw-bolder fs-7 text-uppercase gs-0 text-gray-800 py-6 px-6'>
            <th className='text-center p-2'>{res.Aging}</th>
            <th className='text-center p-2'>{res.TouchedCount}</th>
            <th className='text-center p-2'>{ currencyFormatter.format(res.TouchedAmount)}</th>
            <th className='text-center p-2'>{res.UnTouchedCount}</th>
            <th className='text-center p-2'>{ currencyFormatter.format(res.UnTouchedAmount)}</th>
            <th className='text-center p-2'>{TotalClaimsLines}</th>
            <th className='text-center p-2'>{currencyFormatter.format(TotalClaimsAmount)}</th>
            <th className='text-center p-2'>{ Number(TotalClaimsAmount / FianlTotalClaimsAmount * 100).toFixed(0) }</th>
          </tr>
          <tr className='text-start  fw-bolder fs-7 text-uppercase gs-0 text-gray-800 py-6 px-6'>
            <th className='text-center p-2'>Total</th>
            <th className='text-center p-2'>{TotalAddressedCount}</th>
            <th className='text-center p-2'>{ currencyFormatter.format(TotalAddressedAmount)}</th>
            <th className='text-center p-2'>{TotalUnAddressedCount}</th>
            <th className='text-center p-2'>{ currencyFormatter.format(TotalUnAddressedAmount)}</th>
            <th className='text-center p-2'>{GrnadTotalClaimsLines}</th>
            <th className='text-center p-2'>{currencyFormatter.format(FianlTotalClaimsAmount)}</th>
            <th className='text-center p-2'>{FinalPercentage}</th>
          </tr>
          </>
          

        )
      }
      return (

          <tr className='text-start  fw-bolder fs-7 text-uppercase gs-0 text-gray-800 py-6 px-6'>
            <th className='text-center p-2'>{res.Aging}</th>
            <th className='text-center p-2'>{res.TouchedCount}</th>
            <th className='text-center p-2'>{ currencyFormatter.format(res.TouchedAmount)}</th>
            <th className='text-center p-2'>{res.UnTouchedCount}</th>
            <th className='text-center p-2'>{ currencyFormatter.format(res.UnTouchedAmount)}</th>
            <th className='text-center p-2'>{TotalClaimsLines}</th>
            <th className='text-center p-2'>{currencyFormatter.format(TotalClaimsAmount)}</th>
            <th className='text-center p-2'>{ Number(TotalClaimsAmount / FianlTotalClaimsAmount * 100).toFixed(0) }</th>
          </tr>
      )
    })
  }

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

        <div className='row'>
          <div className='col-12'>

            <table
              id='kt_table_users'
              className=' w-100 table-bordered align-middle fs-6 p-4  font-family-base no-footer w-full '
            >
              <thead >
                <tr className='text-start  fw-bolder fs-7 text-uppercase gs-0 text-gray-800 py-6 px-6'>
                  <th className='text-center p-2' colSpan={8} >Addressed and Unaddressed Details By Age and Dollar</th>
                </tr>
                <tr className='text-start  fw-bolder fs-7 text-uppercase gs-0 text-gray-800 py-6 px-6'>
                  <th className='text-center p-2'  >Aging</th>
                  <th className='text-center p-2' colSpan={2} >Addressed AR</th>
                  <th className='text-center p-2' colSpan={2} >UnAddressed AR</th>
                  <th className='text-center p-2'  >Total</th>
                  <th className='text-center p-2' ></th>
                  <th className='text-center p-2'  >%</th>
                </tr>
                

                <tr className='text-start  fw-bolder fs-7 text-uppercase gs-0 text-gray-800 py-6 px-6'>
                  <th className='text-center p-2'  ></th>
                  <th className='text-center p-2'  >#</th>
                  <th className='text-center p-2'  >$</th>
                  <th className='text-center p-2'  >#</th>
                  <th className='text-center p-2'  >$</th>
                  <th className='text-center p-2'  >#</th>
                  <th className='text-center p-2'  >$</th>
                  <th className='text-center p-2' colSpan={2} ></th>
                </tr>

              </thead>
              <tbody className='text-gray-600 fw-medium p-8'>
                {Result}
              </tbody>
              
            </table>
            {/* {PieChartData.length > 0 ? 
            <Chart chartType="ColumnChart" data={PieChartData} options={{
              colors: ['#b2e2fd'],
              animation: {
                duration: 1500,
                startup: true
              },
              is3D: true,
              title: 'Charges & Payments',
            }} width={"100%"} height={"400px"} />: null} */}
            {/* {PieChartData.length > 0 ? 

            <Chart chartType="ColumnChart" data={PieChartData} options={{ title: "Charges & Payments", is3D: true, }} width={"100%"} height={"200px"} /> 
            
            : null} */}
            <div className="card shadow-sm">
              {/* <div className="card-header">
                <h3 className="card-title">Title</h3>
              </div> */}
              <div className="card-body">
                <ul>
                  <li>Total claims are xx and OS AR is $xx, out of which xx% of the claims are less than 90 days. </li>
                  <li>xx% of the claims are sitting in unaddressed (Out of which 0-45% contributes xx%) and xx% of the claims are already addressed. </li>
                  <li>Unaddressed claims are being worked by priority, along with Due for Follow up, with the strategy of High Dollar claims and Old aging </li>
                  <li>Total claims Addressed are xx, out of which xx claims are Due which are being addressed as priority (WIP), rest of the xx Claims are already worked, which are “Not in Due” </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
export { ARDetails }