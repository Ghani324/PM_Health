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
const getLocationName = `/api/ChargesByProvider/getLocationName`
const getPracticeDashboard = `/api/ChargesByProvider/getPracticeDashboard`

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const PaymentsBreakDownbyProvider: React.FC = () => {
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
  const [PaymentsData, setPaymentsData] = useState([])
  const [open, setOpen] = React.useState(false);
  const [GetCountByPosttedTable,setGetCountByPosttedTable] = useState([])
  const FilterDataList = async () => {

    setOpen(true)
    axios.get(`${getPracticeDashboard}?FromDate=${DateMonthFrom}&ToDate=${DateMonthTo}&PracticeName=${SelectedPracticeList.length > 0 ? JSON.stringify(SelectedPracticeList) : ""}`).then(_res => {
      setOpen(false)
      setPieChartData(_res.data.data)
      setPaymentsData(_res.data.PaymentsResult)
      setGetCountByPosttedTable(_res.data.GetCountByPosttedTable)
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
  const getLocationNameData = async () => {
    const Result = await axios.get(getLocationName)
    setUserNameDatas(Result.data.PracticeData)
  }
  useEffect(() => {
    getLocationNameData()
  }, [])
  var UsersListData: any = []
  UserNameDatas.map((practiceList: any, index) => {
    UsersListData.push({
      label: practiceList.provider,
      value: practiceList.provider
    })
  })
  var GeneeratePieChartData : any = []
  var TotalListChart = []
  var LocationList :any = ["","Charges","Payments"]
  TotalListChart.push(LocationList)
  var TotalChargesValues :any= [""]
  var TotalpaymentsValues :any= [""]
  var TotalClaims : any = 0;
  var Totalcharges : any = 0;
  var Totalpayments : any = 0;
  var Result :any;
  if(PieChartData.length > 0){
    Result = PieChartData.map((res: any, _inde: any) => {

      
      var FilterDataCountClaims :any = GetCountByPosttedTable.filter((x:any)=> x.provider == res.provider)
      var FilterData :any = PaymentsData.filter((x:any)=> x.provider == res.provider)
      TotalClaims += Number(FilterDataCountClaims[0].count)
      Totalcharges += Number(res.charges)
      Totalpayments += Number(FilterData[0].payments)
      TotalChargesValues.push(Number(Totalcharges))
      TotalpaymentsValues.push(Number(Totalpayments))
      GeneeratePieChartData = [res.provider,res.charges,FilterData[0].payments]
      TotalListChart.push(GeneeratePieChartData)
      if(_inde == PieChartData.length - 1){
        
          return (
              <>
              <tr>
                <td >{res.provider}</td>
                <td >{FilterDataCountClaims[0]}</td>
                <td >{currencyFormatter.format(res.charges)}</td>
                <td >{currencyFormatter.format(FilterData[0].payments)}</td>
                <td >{Number(Number(res.charges) / Number(FilterData[0].payments)).toFixed(2)}%</td>
              </tr>
              <tr>
                <td >Grand Total</td>
                <td >{TotalClaims}</td>
                <td >{currencyFormatter.format(Totalcharges)}</td>
                <td >{currencyFormatter.format(Totalpayments)}</td>
                <td >{Number(Totalcharges / Totalpayments).toFixed(2)}%</td>
              </tr>
              </>
            )
            
      }else {
          return (
              <tr>
                <td >{res.provider}</td>
                <td >{FilterDataCountClaims[0]}</td>
                <td >{currencyFormatter.format(res.charges)}</td>
                <td >{currencyFormatter.format(FilterData[0].payments)}</td>
                <td >{Number(Number(res.charges) / Number(FilterData[0].payments)).toFixed(2)}%</td>
              </tr>
            )
      }
      
    })
  }
  console.log("TotalListChart",TotalListChart)
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
            <h3 className='fw-bolder m-0'>Charges and  Collections By Provider</h3>
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
                  <span className=''>Provider List</span>
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

          {Result ? 
            <Chart chartType="Bar" data={TotalListChart} options={{
              
              animation: {
                duration: 1500,
                startup: true
              },
              is3D: true,
              title: 'Charges and Collections By Location',
            }} width={"100%"} height={"400px"} /> : ""}

{Result ?<table id='kt_table_users' className='table-row-gray-700 table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'>
                  <thead>
                    <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
                      <th>Provider</th>
                      <th>Claims</th>
                      <th>Charges</th>
                      <th>Payments</th>
                      <th>% of Payment's</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-bold' >
                  {Result}
                  </tbody>
                </table> : ""}

          
            {/* {PieChartData.length > 0 ? 

            <Chart chartType="ColumnChart" data={PieChartData} options={{ title: "Charges & Payments", is3D: true, }} width={"100%"} height={"200px"} /> 
            
            : null} */}
            <div className="card shadow-sm">
              {/* <div className="card-header">
                <h3 className="card-title">Title</h3>
              </div> */}
              {Result ?<div className="card-body">
                <ul>
                  <li>Major Contributions are from top 3 providers is 89.53% on the overall payments. Rest of the doctors contribute to 10.47%</li>
                  <li>Total claims entered from February’2022 to February’2023 and the corresponding values and collections followed as Claims (xx), $xx (Charge Value) and $xx (Collections)</li>
                  
                </ul>
              </div> : ""}
            </div>
          </div>
          
        </div>
      </div>
    </>
  )
}
export { PaymentsBreakDownbyProvider }