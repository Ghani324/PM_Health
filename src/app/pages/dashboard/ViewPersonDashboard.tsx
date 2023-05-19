import React, { useState, useEffect, HTMLAttributes } from 'react'
import axios, { AxiosResponse } from "axios";
import moment from "moment"
import { useLocation, useNavigate } from 'react-router-dom'
import { Chart } from "react-google-charts";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
const API_URL = process.env.REACT_APP_THEME_API_URL

const getClaimbyUser = `/api/Claims/getClaimbyUser`
const options = { style: 'currency', currency: 'USD' };

interface TableHeaderCellProps extends HTMLAttributes<HTMLTableCellElement> {
    colSpan: number;
}

const thead: React.CSSProperties = {
    color: "#fff",
    backgroundColor: "#002d72",
    top: 70,
    position: 'sticky',
};


const ViewPersonDashboard: React.FC = () => {
    const [CurrentPayerName, setCurrentPayerName] = React.useState({ UserId: "" });
    const [FromDate, setFromDate] = useState()
    const [ToDate, setToDate] = useState()
    const [UserName, setUserName] = useState<string>()
    const navigate = useNavigate();
    const location = useLocation();
    const userDetails: any = location.state;
    const [userDetailsState, setUserDetailsState] = useState()

    const [Loading, setLoading] = useState<boolean>(false)
    const [selectedRows, setSelectedRows] = React.useState([]);
    const [duedate, setduedate] = React.useState("");
    const [Comments, setComments] = React.useState("");
    const [ClaimHistoryData, setClaimHistoryData] = React.useState([]);

    //payer chart
    const [ChartOptionsForClaim, setChartOtpionsForClaim] = useState({
        title: "Payer Wise vs No of claims", fontSize: 10, isStacked: true, hAxis: { title: "Payer Wise", minValue: 0, titleTextStyle: { color: 'black' } }, vAxis: { title: "No of Claims", titleTextStyle: { color: "black" } }, backgroundColor: '#F7F7F7',
        colors: ['#FF9900', 'transparent'],
    })

    const [ChartOptions, setChartOtpions] = useState({
        title: "Payer Wise vs Claim Balance", fontSize: 10, isStacked: true, hAxis: { title: "Payer Wise", minValue: 0, titleTextStyle: { color: 'black' } }, vAxis: { title: "Claim Balance", titleTextStyle: { color: 'black' } },
        colors: ['#109618', 'transparent'], backgroundColor: "#F7F7F7"
    })

    //status chart
    const [ChartOptionsStatusForClaim, setChartOptionsStatusForClaim] = useState({
        title: "Status Wise vs No of claims", fontSize: 10, isStacked: true, hAxis: { title: "Status Wise", minValue: 0, titleTextStyle: { color: 'black' } }, vAxis: { title: "No of Claims", titleTextStyle: { color: "black" } }, backgroundColor: '#F7F7F7',
        colors: ['#FF9900', 'transparent'],
    })
    const [ChartOptionsStatus, setChartOtpionsStatus] = useState({
        title: "Status Wise vs Claim Balance", fontSize: 10, isStacked: true, hAxis: { title: "Status Wise", minValue: 0, titleTextStyle: { color: 'black' } }, vAxis: { title: "Claim Balance", titleTextStyle: { color: 'black' } },
        colors: ['#109618', 'transparent'], backgroundColor: "#F7F7F7"
    })


    //provider chart
    const [ChartOptionsProviderForClaim, setChartOptionsProviderForClaim] = useState({
        title: "Provider Wise vs No of claims", fontSize: 10, isStacked: true, hAxis: { title: "Provider Wise", minValue: 0, titleTextStyle: { color: 'black' } }, vAxis: { title: "No of Claims", titleTextStyle: { color: "black" } }, backgroundColor: '#F7F7F7',
        colors: ['#FF9900', 'transparent'],
    })

    const [ChartOptionsProvider, setChartOtpionsProvider] = useState({
        title: "Provider Wise vs Claim Balance", fontSize: 10, isStacked: true, hAxis: { title: "Provider Wise", minValue: 0, titleTextStyle: { color: 'black' } }, vAxis: { title: "Claim Balance", titleTextStyle: { color: 'black' } },
        colors: ['#109618', 'transparent'], backgroundColor: "#F7F7F7"
    })

    //Rootcause chart
    const [ChartOptionsRootCauseForClaim, setChartOptionsRootCauseForClaim] = useState({
        title: "RootCause Wise vs No of claims", fontSize: 10, isStacked: true, hAxis: { title: "RootCause Wise", minValue: 0, titleTextStyle: { color: 'black' } }, vAxis: { title: "No of Claims", titleTextStyle: { color: "black" } }, backgroundColor: '#F7F7F7',
        colors: ['#FF9900', 'transparent'],
    })

    const [ChartOptionsRootCause, setChartOptionsRootCause] = useState({
        title: "RootCause Wise vs Claim Balance", fontSize: 10, isStacked: true, hAxis: { title: "RootCause Wise", minValue: 0, titleTextStyle: { color: 'black' } }, vAxis: { title: "Claim Balance", titleTextStyle: { color: 'black' } },
        colors: ['#109618', 'transparent'], backgroundColor: "#F7F7F7"
    })

    //Practice chart
    const [ChartOptionsPracticeForClaim, setChartOptionsPracticeForClaim] = useState({
        title: "Practice Wise vs No of claims", fontSize: 10, isStacked: true, hAxis: { title: "Practice Wise", minValue: 0, titleTextStyle: { color: 'black' } }, vAxis: { title: "No of Claims", titleTextStyle: { color: "black" } }, backgroundColor: '#F7F7F7',
        colors: ['#FF9900', 'transparent'],
    })

    const [ChartOptionsPractice, setChartOptionsPractice] = useState({
        title: "Practice Wise vs Claim Balance", fontSize: 10, isStacked: true, hAxis: { title: "Practice Wise", minValue: 0, titleTextStyle: { color: 'black' } }, vAxis: { title: "Claim Balance", titleTextStyle: { color: 'black' } },
        colors: ['#109618', 'transparent'], backgroundColor: "#F7F7F7"
    })

    //Aging chart
    const [ChartOptionsAgingForClaim, setChartOptionsAgingForClaim] = useState({
        title: "Aging Wise vs No of claims", fontSize: 10, isStacked: true, hAxis: { title: "Aging Wise", minValue: 0, titleTextStyle: { color: 'black' } }, vAxis: { title: "No of Claims", titleTextStyle: { color: "black" } }, backgroundColor: '#F7F7F7',
        colors: ['#FF9900', 'transparent'],
    })

    const [ChartOptionsAging, setChartOptionsAging] = useState({
        title: "Aging Wise vs Claim Balance", fontSize: 10, isStacked: true, hAxis: { title: "Aging Wise", minValue: 0, titleTextStyle: { color: 'black' } }, vAxis: { title: "Claim Balance", titleTextStyle: { color: 'black' } },
        colors: ['#109618', 'transparent'], backgroundColor: "#F7F7F7"
    })

    //payer wise
    const [ChartData, setChartData] = useState([])
    const [ChartDataForClaim, setChartDataForClaim] = useState([])
    const [PayerNameTableData, setPayerNameTableData] = useState([])


    //status wise
    const [ChartStatusWiseData, setChartStatusWiseData] = useState([])
    const [ChartStatusWiseDataForClaim, setChartStatusWiseDataForClaim] = useState([])
    const [StatusWiseTableData, setStatusWiseTableData] = useState([])

    //Provider wise
    const [ChartProviderData, setChartProviderData] = useState([])
    const [ChartProviderDataForClaim, setChartProviderDataForClaim] = useState([])
    const [ProviderWiseTableData, setProviderWiseTableData] = useState([])


    //Rootcause wise
    const [ChartRootCauseData, setChartRootCauseData] = useState([])
    const [ChartRootCauseDataForClaim, setChartRootCauseDataForClaim] = useState([])
    const [RootCauseTableData, setRootCauseTableData] = useState([])

    //Practice wise 
    const [ChartPracticeWiseData, setChartPracticeWiseData] = useState([])
    const [ChartPracticeWiseDataForClaim, setChartPracticeWiseDataForClaim] = useState([])
    const [PracticeWiseTableData, setPracticeWiseTableData] = useState([])

    //Aging wise
    const [ChartAgingWiseData, setChartAgingWiseData] = useState([])
    const [ChartAgingWiseDataForClaim, setChartAgingWiseDataForClaim] = useState([])
    const [AgingeTableData, setAgingeTableData] = useState([])

    const [SelectedPractice, setSelectedPractice] = useState([])
    const [GetClaimData, setGetClaimData] = React.useState([])
    const [DisplayNames, setDisplayNames] = React.useState([{ label: "", value: "" }])
    const [SelectedValue, setSeSelectedValue] = React.useState({ label: "Select", value: "" })
    const [getPmListData, setdatas] = useState([{ PmName: "", _id: "" }])
    const [selectedRadio, setSelectedRadio] = useState('');

    useEffect(() => {
        setUserDetailsState(userDetails)
        setCurrentPayerName(userDetails)
        setFromDate(userDetails.fromDate)
        setToDate(userDetails.toDate)
        setUserName(userDetails.UserName)
    }, [])

    const handleRadioChange = async (e: any) => {
        setSelectedRadio(e.target.value)
        setChartData([])
        setChartDataForClaim([])
        setPayerNameTableData([])
        setChartStatusWiseData([])
        setChartStatusWiseDataForClaim([])
        setStatusWiseTableData([])
        setChartProviderData([])
        setChartProviderDataForClaim([])
        setProviderWiseTableData([])
        setChartRootCauseData([])
        setChartRootCauseDataForClaim([])
        setRootCauseTableData([])
        setChartPracticeWiseData([])
        setChartPracticeWiseDataForClaim([])
        setPracticeWiseTableData([])
        setChartAgingWiseData([])
        setChartAgingWiseDataForClaim([])
        setAgingeTableData([])
        setLoading(true)
        if (userDetailsState) {
            await axios.get(`${getClaimbyUser}?UserId=${CurrentPayerName.UserId}&radio=${e.target.value}&FromDate=${FromDate}&ToDate=${ToDate}`).then(_res => {

                if (_res.data.Radio === "PAYER WISE") {
                    setChartData(_res.data.PayerNameData)
                    setChartDataForClaim(_res.data.PayerNameDataForClaim)
                    setPayerNameTableData(_res.data.PayerNameDataTable)
                    setLoading(false)
                }

                if (_res.data.Radio === "STATUS WISE") {
                    setChartStatusWiseData(_res.data.StatusWiseData)
                    setChartStatusWiseDataForClaim(_res.data.StatusWiseDataForClaim)
                    setStatusWiseTableData(_res.data.StatusWiseTableData)
                    setLoading(false)
                }
                if (_res.data.Radio === "PROVIDER WISE") {
                    setChartProviderData(_res.data.ProviderNameWiseData)
                    setChartProviderDataForClaim(_res.data.ProviderNameWiseDataForClaim)
                    setProviderWiseTableData(_res.data.ProviderWiseTableData)
                    setLoading(false)
                }
                if (_res.data.Radio === "ROOTCAUSE WISE") {
                    setChartRootCauseData(_res.data.RootCauseData)
                    setChartRootCauseDataForClaim(_res.data.RootCauseDataForClaim)
                    setRootCauseTableData(_res.data.RootCauseWiseTableData)
                    setLoading(false)
                }
                if (_res.data.Radio === "PRACTICE WISE") {
                    setChartPracticeWiseData(_res.data.PracticeWiseData)
                    setChartPracticeWiseDataForClaim
                        (_res.data.PracticeWiseDataForClaim)
                    setPracticeWiseTableData(_res.data.PracticeWiseTableData)
                    setLoading(false)
                }
                if (_res.data.Radio === "AGING WISE") {
                    setChartAgingWiseData(_res.data.AgeingWiseChartData)
                    setChartAgingWiseDataForClaim
                        (_res.data.AgeingWiseChartDataForClaim)
                    setAgingeTableData(_res.data.AgeingWiseTableData)
                    setLoading(false)
                }

            })



        }
    }

    const handleReload = async () => {

        setChartData([])
        setChartDataForClaim([])
        setPayerNameTableData([])
        setChartStatusWiseData([])
        setChartStatusWiseDataForClaim([])
        setStatusWiseTableData([])
        setChartProviderData([])
        setChartProviderDataForClaim([])
        setProviderWiseTableData([])
        setChartRootCauseData([])
        setChartRootCauseDataForClaim([])
        setRootCauseTableData([])
        setChartPracticeWiseData([])
        setChartPracticeWiseDataForClaim([])
        setPracticeWiseTableData([])
        setChartAgingWiseData([])
        setChartAgingWiseDataForClaim([])
        setAgingeTableData([])
        setLoading(true)
        if (userDetailsState) {
            await axios.get(`${getClaimbyUser}?UserId=${CurrentPayerName.UserId}&radio=${selectedRadio}&FromDate=${FromDate}&ToDate=${ToDate}`).then(_res => {

                if (_res.data.Radio === "PAYER WISE") {
                    setChartData(_res.data.PayerNameData)
                    setChartDataForClaim(_res.data.PayerNameDataForClaim)
                    setPayerNameTableData(_res.data.PayerNameDataTable)
                    setLoading(false)
                }

                if (_res.data.Radio === "STATUS WISE") {
                    setChartStatusWiseData(_res.data.StatusWiseData)
                    setChartStatusWiseDataForClaim(_res.data.StatusWiseDataForClaim)
                    setStatusWiseTableData(_res.data.StatusWiseTableData)
                    setLoading(false)
                }
                if (_res.data.Radio === "PROVIDER WISE") {
                    setChartProviderData(_res.data.ProviderNameWiseData)
                    setChartProviderDataForClaim(_res.data.ProviderNameWiseDataForClaim)
                    setProviderWiseTableData(_res.data.ProviderWiseTableData)
                    setLoading(false)
                }
                if (_res.data.Radio === "ROOTCAUSE WISE") {
                    setChartRootCauseData(_res.data.RootCauseData)
                    setChartRootCauseDataForClaim(_res.data.RootCauseDataForClaim)
                    setRootCauseTableData(_res.data.RootCauseWiseTableData)
                    setLoading(false)
                }
                if (_res.data.Radio === "PRACTICE WISE") {
                    setChartPracticeWiseData(_res.data.PracticeWiseData)
                    setChartPracticeWiseDataForClaim
                        (_res.data.PracticeWiseDataForClaim)
                    setPracticeWiseTableData(_res.data.PracticeWiseTableData)
                    setLoading(false)
                }
                if (_res.data.Radio === "AGING WISE") {
                    setChartAgingWiseData(_res.data.AgeingWiseChartData)
                    setChartAgingWiseDataForClaim
                        (_res.data.AgeingWiseChartDataForClaim)
                    setAgingeTableData(_res.data.AgeingWiseTableData)
                    setLoading(false)
                }

            })



        }
    }



    const ViewClaimDetails = async (ids: any) => {
        console.log("ids", ids)
    }

    const handleChangeUser = (event: any) => {
        setSeSelectedValue(event)
    };

    const GoToBack = (event: any) => {
        navigate('/dashboard')
    }
    const handleChangeInput = (event: any) => {

        if (event.target.name === "duedate") {
            setduedate(event.target.value)
        }
        if (event.target.name === "Comments") {
            setComments(event.target.value)
        }
        if (event.target.name === "UpdateCommentsFiled") {
            setComments(event.target.value)
        }
    };

    var PmListData = [{ label: "Select", value: "" }]
    getPmListData.map((name) => (
        PmListData.push({
            label: name.PmName,
            value: name._id
        })
    ))
    var ColumnNames = ["ClaimBilledAmount", "ClaimPayment", "ClaimBalance", "ClaimAdjustemnt", "ProcedureBalance", "ProcedureBilledAmount", "ProcedurePayment", "ProcedureAdjustment"]

    var DateColumnNames = ["DateOfService", "IntialClaimDate", "PatientDOB", "DueDate"]
    return (
        <div >
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={Loading}
            // onClick={handleClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            <div className='row'>
                <div className='d-flex'>
                    <div className='mx-4 pb-1'>
                        <button type='button' value="Ar" onClick={GoToBack} className='btn btn-primary' >Back</button>

                    </div>
                    <div className='mx-2 pb-1'>
                        {selectedRadio ? <button type='button' value="Ar" onClick={handleReload} className='btn btn-primary' >Reload</button> : <button type='button' value="Ar" onClick={handleReload} className='btn btn-primary' disabled>Reload</button>}

                    </div>
                </div>

                <span className='my-4'>Showing results :  <h4>{UserName}</h4></span>

                <hr />
                <h3 className='mb-6'>See reports by </h3>

                <div className='radios mb-6 d-flex justify-content-around'>
                    <div className="form-check form-check-inline ">
                        <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1"
                            value="PAYER WISE"
                            onChange={handleRadioChange}
                        />
                        <label className="form-check-label" htmlFor="flexRadioDefault1">
                            PAYER WISE
                        </label>
                    </div>

                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2"
                            value="STATUS WISE" onChange={handleRadioChange} />
                        <label className="form-check-label" htmlFor="flexRadioDefault2">
                            STATUS WISE
                        </label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2"
                            value="PROVIDER WISE" onChange={handleRadioChange} />
                        <label className="form-check-label" htmlFor="flexRadioDefault2">
                            PROVIDER WISE
                        </label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2"
                            value="ROOTCAUSE WISE" onChange={handleRadioChange} />
                        <label className="form-check-label" htmlFor="flexRadioDefault2">
                            ROOTCAUSE WISE
                        </label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2"
                            value="PRACTICE WISE" onChange={handleRadioChange} />
                        <label className="form-check-label" htmlFor="flexRadioDefault2">
                            PRACTICE WISE
                        </label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2"
                            value="AGING WISE" onChange={handleRadioChange} />
                        <label className="form-check-label" htmlFor="flexRadioDefault2">
                            AGING WISE
                        </label>
                    </div>
                </div>

                {/* Payer wise  */}
                <div>
                    <div className='d-flex flex-row justify-content-around '>
                        <div className='col-5 shadow'>
                            {ChartDataForClaim.length > 0 ? (
                                <div >
                                    <Chart
                                        chartType='ColumnChart'
                                        width='100%'
                                        height='500px'
                                        data={ChartDataForClaim}
                                        options={ChartOptionsForClaim}
                                    />
                                </div>

                            ) : null}
                        </div>

                        <div className='col-5 shadow '>
                            {ChartData.length > 0 ? (
                                <div >
                                    <Chart
                                        chartType='ColumnChart'
                                        width='100%'
                                        height='500px'
                                        data={ChartData}
                                        options={ChartOptions}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className='shadow mt-8 '>
                        {PayerNameTableData.length > 0 ? (
                            <div className='col-12 ' >
                                <h4 className='text-center mb-8 captilize'>PAYER WISE TABLE</h4>
                                <table
                                    id='kt_table_users'
                                    className=' table-bordered align-middle fs-6 p-4  font-family-base no-footer w-full '
                                >
                                    <thead style={thead}>
                                        <tr className='text-start  fw-bolder fs-7 text-uppercase gs-0 text-gray-800 py-6 px-6'>
                                            <th className='px-3 py-2'></th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>0-60</th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>60-120</th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>120 and more</th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>Total</th>
                                        </tr>
                                        <tr>
                                            <th className="text-center p-2">Payer Wise</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-gray-600 fw-medium p-8'>
                                        {PayerNameTableData.map((res: any, _inde: any) => {
                                            return (
                                                <tr className='py-10 px-4'>
                                                    <td className='px-3 py-2'>{res.lookUpName ? res.lookUpName : "None"}</td>
                                                    <td className='px-3 py-2'>{res.Count60 ? res.Count60 : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount60 ? res.TotalAmount60.toLocaleString('en-US', options) : "-"}
                                                    </td>

                                                    <td className='px-3 py-2'>{res.Count120 ? res.Count120 : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount120 ? res.TotalAmount120.toLocaleString('en-US', options) : "-"}
                                                    </td>

                                                    <td className='px-3 py-2'>{res.Count120plus ? res.Count120plus : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount120plus ? res.TotalAmount120plus.toLocaleString('en-US', options) : "-"}
                                                    </td>

                                                    <td className='px-3 py-2'>{res.Count ? res.Count : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount ? res.TotalAmount.toLocaleString('en-US', options) : "-"}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}
                    </div>



                </div>

                {/* status wise */}
                <div>
                    <div className='d-flex flex-row justify-content-around '>
                        <div className='col-5 shadow'>
                            {ChartStatusWiseDataForClaim.length > 0 ? (
                                <div >
                                    <Chart
                                        chartType='ColumnChart'
                                        width='100%'
                                        height='500px'
                                        data={ChartStatusWiseDataForClaim}
                                        options={ChartOptionsStatusForClaim}
                                    />
                                </div>

                            ) : null}
                        </div>

                        <div className='col-5 shadow '>
                            {ChartStatusWiseData.length > 0 ? (
                                <div >
                                    <Chart
                                        chartType='ColumnChart'
                                        width='100%'
                                        height='500px'
                                        data={ChartStatusWiseData}
                                        options={ChartOptionsStatus}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className='shadow mt-8 '>
                        {StatusWiseTableData.length > 0 ? (
                            <div className='col-12 ' >
                                <h4 className='text-center mb-8 captilize'>STATUS WISE TABLE</h4>
                                <table
                                    id='kt_table_users'
                                    className=' table-bordered align-middle fs-6 p-4  font-family-base no-footer w-full '
                                >
                                    <thead style={thead}>
                                        <tr className='text-start  fw-bolder fs-7 text-uppercase gs-0 text-gray-800 py-6 px-6'>
                                            <th className='px-3 py-2'></th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>0-60</th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>60-120</th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>120 and more</th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>Total</th>
                                        </tr>
                                        <tr>
                                            <th className="text-center p-2">Status Wise</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-gray-600 fw-medium p-8'>
                                        {StatusWiseTableData.map((res: any, _inde: any) => {
                                            return (
                                                <tr className='py-10 px-4'>
                                                    <td className='px-3 py-2'>{res.lookUpName ? res.lookUpName : "None"}</td>
                                                    <td className='px-3 py-2'>{res.Count60 ? res.Count60 : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount60 ? res.TotalAmount60.toLocaleString('en-US', options) : "-"}
                                                    </td>

                                                    <td className='px-3 py-2'>{res.Count120 ? res.Count120 : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount120 ? res.TotalAmount120.toLocaleString('en-US', options) : "-"}
                                                    </td>

                                                    <td className='px-3 py-2'>{res.Count120plus ? res.Count120plus : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount120plus ? res.TotalAmount120plus.toLocaleString('en-US', options) : "-"}
                                                    </td>

                                                    <td className='px-3 py-2'>{res.Count ? res.Count : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount ? res.TotalAmount.toLocaleString('en-US', options) : "-"}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Provider wise */}

                <div>
                    <div className='d-flex flex-row justify-content-around '>
                        <div className='col-5 shadow'>
                            {ChartProviderDataForClaim.length > 0 ? (
                                <div >
                                    <Chart
                                        chartType='ColumnChart'
                                        width='100%'
                                        height='500px'
                                        data={ChartProviderDataForClaim}
                                        options={ChartOptionsProviderForClaim}
                                    />
                                </div>

                            ) : null}
                        </div>

                        <div className='col-5 shadow '>
                            {ChartProviderData.length > 0 ? (
                                <div >
                                    <Chart
                                        chartType='ColumnChart'
                                        width='100%'
                                        height='500px'
                                        data={ChartProviderData}
                                        options={ChartOptionsProvider}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className='shadow mt-8 '>
                        {ProviderWiseTableData.length > 0 ? (
                            <div className='col-12 ' >
                                <h4 className='text-center mb-8 captilize'>PROVIDER WISE TABLE</h4>
                                <table
                                    id='kt_table_users'
                                    className=' table-bordered align-middle fs-6 p-4  font-family-base no-footer w-full '
                                >
                                    <thead style={thead}>
                                        <tr className='text-start  fw-bolder fs-7 text-uppercase gs-0 text-gray-800 py-6 px-6'>
                                            <th className='px-3 py-2'></th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>0-60</th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>60-120</th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>120 and more</th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>Total</th>
                                        </tr>
                                        <tr>
                                            <th className="text-center p-2">Provider Wise</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-gray-600 fw-medium p-8'>
                                        {ProviderWiseTableData.map((res: any, _inde: any) => {
                                            return (
                                                <tr className='py-10 px-4'>
                                                    <td className='px-3 py-2'>{res.lookUpName ? res.lookUpName : "None"}</td>
                                                    <td className='px-3 py-2'>{res.Count60 ? res.Count60 : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount60 ? res.TotalAmount60.toLocaleString('en-US', options) : "-"}
                                                    </td>

                                                    <td className='px-3 py-2'>{res.Count120 ? res.Count120 : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount120 ? res.TotalAmount120.toLocaleString('en-US', options) : "-"}
                                                    </td>

                                                    <td className='px-3 py-2'>{res.Count120plus ? res.Count120plus : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount120plus ? res.TotalAmount120plus.toLocaleString('en-US', options) : "-"}
                                                    </td>

                                                    <td className='px-3 py-2'>{res.Count ? res.Count : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount ? res.TotalAmount.toLocaleString('en-US', options) : "-"}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Rootcause wise */}

                <div>
                    <div className='d-flex flex-row justify-content-around '>
                        <div className='col-5 shadow'>
                            {ChartPracticeWiseDataForClaim.length > 0 ? (
                                <div >
                                    <Chart
                                        chartType='ColumnChart'
                                        width='100%'
                                        height='500px'
                                        data={ChartPracticeWiseDataForClaim}
                                        options={ChartOptionsPracticeForClaim}
                                    />
                                </div>

                            ) : null}
                        </div>

                        <div className='col-5 shadow '>
                            {ChartPracticeWiseData.length > 0 ? (
                                <div >
                                    <Chart
                                        chartType='ColumnChart'
                                        width='100%'
                                        height='500px'
                                        data={ChartPracticeWiseData}
                                        options={ChartOptionsPractice}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className='shadow mt-8 '>
                        {PracticeWiseTableData.length > 0 ? (
                            <div className='col-12 ' >
                                <h4 className='text-center mb-8 captilize'>ROOTCAUSE WISE TABLE</h4>
                                <table
                                    id='kt_table_users'
                                    className=' table-bordered align-middle fs-6 p-4  font-family-base no-footer w-full '
                                >
                                    <thead style={thead}>
                                        <tr className='text-start  fw-bolder fs-7 text-uppercase gs-0 text-gray-800 py-6 px-6'>
                                            <th className='px-3 py-2'></th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>0-60</th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>60-120</th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>120 and more</th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>Total</th>
                                        </tr>
                                        <tr>
                                            <th className="text-center p-2">RootCause Wise</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-gray-600 fw-medium p-8'>
                                        {PracticeWiseTableData.map((res: any, _inde: any) => {
                                            return (
                                                <tr className='py-10 px-4'>
                                                    <td className='px-3 py-2'>{res.lookUpName ? res.lookUpName : "None"}</td>
                                                    <td className='px-3 py-2'>{res.Count60 ? res.Count60 : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount60 ? res.TotalAmount60.toLocaleString('en-US', options) : "-"}
                                                    </td>

                                                    <td className='px-3 py-2'>{res.Count120 ? res.Count120 : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount120 ? res.TotalAmount120.toLocaleString('en-US', options) : "-"}
                                                    </td>

                                                    <td className='px-3 py-2'>{res.Count120plus ? res.Count120plus : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount120plus ? res.TotalAmount120plus.toLocaleString('en-US', options) : "-"}
                                                    </td>

                                                    <td className='px-3 py-2'>{res.Count ? res.Count : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount ? res.TotalAmount.toLocaleString('en-US', options) : "-"}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Practice wise */}

                <div>
                    <div className='d-flex flex-row justify-content-around '>
                        <div className='col-5 shadow'>
                            {ChartRootCauseDataForClaim.length > 0 ? (
                                <div >
                                    <Chart
                                        chartType='ColumnChart'
                                        width='100%'
                                        height='500px'
                                        data={ChartRootCauseDataForClaim}
                                        options={ChartOptionsRootCauseForClaim}
                                    />
                                </div>

                            ) : null}
                        </div>

                        <div className='col-5 shadow '>
                            {ChartRootCauseData.length > 0 ? (
                                <div >
                                    <Chart
                                        chartType='ColumnChart'
                                        width='100%'
                                        height='500px'
                                        data={ChartRootCauseData}
                                        options={ChartOptionsRootCause}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className='shadow mt-8 '>
                        {RootCauseTableData.length > 0 ? (
                            <div className='col-12 ' >
                                <h4 className='text-center mb-8 captilize'>PRACTICE WISE TABLE</h4>
                                <table
                                    id='kt_table_users'
                                    className=' table-bordered align-middle fs-6 p-4  font-family-base no-footer w-full '
                                >
                                    <thead style={thead}>
                                        <tr className='text-start  fw-bolder fs-7 text-uppercase gs-0 text-gray-800 py-6 px-6'>
                                            <th className='px-3 py-2'></th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>0-60</th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>60-120</th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>120 and more</th>
                                            <th className='text-center p-2' colSpan={2} style={thead}>Total</th>
                                        </tr>
                                        <tr>
                                            <th className="text-center p-2">Practice Wise</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>

                                            <th className="text-center p-2">No of Claims</th>
                                            <th className="text-center p-2">Claim Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-gray-600 fw-medium p-8'>
                                        {RootCauseTableData.map((res: any, _inde: any) => {
                                            return (
                                                <tr className='py-10 px-4'>
                                                    <td className='px-3 py-2'>{res.lookUpName ? res.lookUpName : "None"}</td>
                                                    <td className='px-3 py-2'>{res.Count60 ? res.Count60 : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount60 ? res.TotalAmount60.toLocaleString('en-US', options) : "-"}
                                                    </td>

                                                    <td className='px-3 py-2'>{res.Count120 ? res.Count120 : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount120 ? res.TotalAmount120.toLocaleString('en-US', options) : "-"}
                                                    </td>

                                                    <td className='px-3 py-2'>{res.Count120plus ? res.Count120plus : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount120plus ? res.TotalAmount120plus.toLocaleString('en-US', options) : "-"}
                                                    </td>

                                                    <td className='px-3 py-2'>{res.Count ? res.Count : "-"}</td>
                                                    <td className='px-3 py-2'>
                                                        {res.TotalAmount ? res.TotalAmount.toLocaleString('en-US', options) : "-"}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Aging Wise */}
                <div>
                    <div className='d-flex flex-row justify-content-around mt--10'>
                        <div className='col-5 shadow'>
                            {ChartAgingWiseDataForClaim.length > 0 ? (
                                <div >
                                    <Chart
                                        chartType='ColumnChart'
                                        width='100%'
                                        height='600px'
                                        data={ChartAgingWiseDataForClaim}
                                        options={ChartOptionsAgingForClaim}
                                    />
                                </div>
                            ) : null}
                        </div>
                        <div className='col-5 shadow'>
                            {ChartAgingWiseData.length > 0 ? (
                                <div >
                                    <Chart
                                        chartType='ColumnChart'
                                        width='100%'
                                        height='600px'
                                        data={ChartAgingWiseData}
                                        options={ChartOptionsAging}
                                    />
                                </div>
                            ) : null}
                        </div>

                    </div>
                    <div>
                        <div className='d-flex justify-content-center mt-8'>
                            {AgingeTableData.length > 0 ? (
                                <div className='col-6 d-flex flex-column justify-content-center'>
                                    <h4 className='text-center mb-8 captilize'>AGING WISE TABLE</h4>
                                    <table
                                        id='kt_table_users'
                                        className='table-bordered align-middle table-row-dashed fs-6  dataTable no-footer font-family-base'
                                    >
                                        <thead style={thead}>
                                            <tr className='text-start  fw-bolder fs-7 text-uppercase gs-0 text-gray-800 py-6 px-6'>
                                                <th className='text-center px-3 p-2' style={thead}>Aging Wise</th>
                                                <th className='text-center px-3 p-2' style={thead}>No of Claims</th>
                                                <th className='text-center px-3 p-2' style={thead}>Claim Balance Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className='text-gray-600 fw-bold'>
                                            {AgingeTableData.map((res: any, _inde: any) => {
                                                return (
                                                    <tr>
                                                        <td className='text-center px-3 p-2'>{res.lookUpName ? res.lookUpName : 'None'}</td>
                                                        <td className='text-center px-3 p-2'>{res.Count ? res.Count : "-"}</td>
                                                        <td className='text-center px-3 p-2'>{res.TotalAmount ? Number(res.TotalAmount).toLocaleString('en-US', options) : "-"}</td>


                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : null}
                        </div>

                    </div>
                </div>



            </div>

        </div>


    )

}
export { ViewPersonDashboard }