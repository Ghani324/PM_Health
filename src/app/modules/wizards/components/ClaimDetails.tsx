import React, { useState, useEffect, useRef } from 'react'
// import { DataGrid, GridToolbar, GridFilterModel, GridRowParams, getGridStringOperators, GridFilterOperator, GridFilterItem, GridFilterInputValueProps } from '@mui/x-data-grid'
import axios from "axios";
// import Select from 'react-select';
// import swal from "sweetalert"
// import { KTSVG } from '../../../../_metronic/helpers'
// import { userData } from "./StatusCode"
import moment from "moment"
// import { Chart } from "react-google-charts";
import { useLocation, useNavigate } from 'react-router-dom'
import swal from 'sweetalert';
import { boolean } from 'yup';

const API_URL = process.env.REACT_APP_THEME_API_URL
// const pmsystemUrl = `/api/Claims/getClaimsbyid`
// const GetClaimOutstanding = `/api/Claims/GetClaimOutstandingbyid`

const getClaimHistory = `/api/Claims/getClaimHistory`
const claimsDetails = `/api/Claims/claimsdetails`
// const ClaimUpdateUrl = `/api/Claims/ClaimUpdate`
// const getPracticeList = `/api/practice/getPracticeListById`

// const getPmList = `/api/pmsystem/getPmList`
// const PostComments = `/api/Claims/PostComments`


const ClaimDetails: React.FC = () => {
    const [CurrentPayerName, setCurrentPayerName] = React.useState({ data: "", Type: "", PracticeId: "", SelectedData: "", BackPageType: "", BackPageData: "", PageType: "" });

    const navigate = useNavigate();
    const location = useLocation();
    const userDetails: any = location.state;

    const [selectedRows, setSelectedRows] = React.useState([]);
    const [duedate, setduedate] = React.useState("");
    const [Comments, setComments] = React.useState("");
    const [ClaimHistoryData, setClaimHistoryData] = React.useState([]);

    const [SelectedPractice, setSelectedPractice] = useState([])
    const [GetClaimData, setGetClaimData] = React.useState([])
    const [DisplayNames, setDisplayNames] = React.useState([{ label: "", value: "" }])
    const [SelectedValue, setSeSelectedValue] = React.useState({ label: "Select", value: "" })
    const [getPmListData, setdatas] = useState([{ PmName: "", _id: "" }])
    const [sendData, setsendData] = React.useState<any>([{}])
    const [uploader, setuploader] = useState('')
    const [fileName, setfileName] = useState('')
    const fileInput = useRef<any>()
    const [istrue, setistrue] = useState(false)



    const fetchData = async () => {
        if (userDetails) {
            console.log("userDetails",userDetails)
            setCurrentPayerName(userDetails)

        }
        const Result = await axios.get(`${getClaimHistory}?ClaimId=${userDetails.data}`)
        setClaimHistoryData(Result.data.data)
        setGetClaimData(Result.data.GetClaimData)
        setDisplayNames(Result.data.getPracticeData.DisplayNames)
        setsendData(Result.data.GetClaimData)
    }
    useEffect(() => {

        //GetPmList()
        fetchData()
    }, [])

    const ViewClaimDetails = async (ids: any) => {
        console.log("ids", ids)
    }

    const handleChangeUser = (event: any) => {
        setSeSelectedValue(event)
    };

    const GoToBack = (event: any) => {
        if (CurrentPayerName.BackPageType == "ClaimsViewbyid") {

            navigate('/ClaimsViewbyid', {
                state: {
                    SelectedData: CurrentPayerName.SelectedData,
                    data: CurrentPayerName.BackPageData,
                    Type: CurrentPayerName.Type,
                    PracticeId: CurrentPayerName.PracticeId,

                    BackPageType: "ClaimsViewbyid"
                }
            })
        } else if (CurrentPayerName.PageType == "CompletedClaims") {
            navigate('/CompletedClaims')
        } else {
            if (CurrentPayerName.BackPageType == "PCA") {
                navigate('/PCA', {
                    state: {
                        SelectedData: CurrentPayerName.SelectedData
                    }
                })
            } else {
                navigate('/ViewClaim', {
                    state: {
                        SelectedData: CurrentPayerName.SelectedData
                    }
                })
            }

        }
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


    const handler = () => {
        if (!uploader) {
            swal({
                title: '',
                icon: "info",
                text: 'Please Choose a File'
            })

        }
        const formdata = new FormData()
        formdata.append('ProviderName', sendData.ProviderName)
        formdata.append('PatientName', sendData.PatientName)
        formdata.append('PayerName', sendData.PayerName)
        formdata.append('ClaimId', sendData._id)
        formdata.append('file', uploader)
        formdata.append('FileName', fileName)

        axios.post(claimsDetails, formdata, { headers: { 'Content-Type': 'multipart/form-data' } }).then(data => {
            if (data.data.msg === 'sucess') {
                swal({
                    title: '',
                    icon: "success",
                    text: 'File Uploaded'


                })
            }
        })
    }

    const fileUploader = (e: any) => {
        let files = fileInput.current.files[0]


        setuploader(files)
        setfileName(fileInput.current.files[0].name)
    }
    console.log('uploader', uploader)

    const show = () => {
        // setistrue(!istrue)

        if (!uploader) {
            swal({
                title: '',
                icon: "info",
                text: 'Upload a File'
            })

        }


        else {

            swal({
                title: 'Verifiy Data',
                icon: "info",
                text: `ProviderName  :  ${sendData.ProviderName}
    
                     PatientName  :  ${sendData.PatientName}
    
                     PayerName  :  ${sendData.PayerName}
                     
                     File        :${fileName}`



            })
        }




    }



    return (



        <div >
            <div className='col-12 fv-row pt-1 pb-1 d-flex justify-content-between'>
                <button type='button' value="Ar" onClick={GoToBack} className='btn btn-primary' >Back</button>
                <div className='d-flex justify-content-around'>

                    {/* <label className="form-label" htmlFor="customFile">Upload File</label> */}
                    <input style={{ marginRight: '50px' }} ref={fileInput} name='file' type="file" className="form-control form-control-lg " id="customFile" onChange={fileUploader} />
                    <button style={{ marginRight: '20px' }} type='button' value="Ar" onClick={show} className='btn btn-primary' >View</button>
                    <button type='button' value="Ar" onClick={handler} className='btn btn-primary' >Submit</button>
                </div>
            </div>
            <hr />
            <div className='row'>
                <h3>Claim Details</h3>
               
            </div>
            
            <hr/>
            <div className='row'>
                {
                    DisplayNames.map((res: any, ind: any) => {
                        var Symbol = null
                        if(ColumnNames.includes(res.value)){
                            Symbol = "$ "
                        }
                        var value : any = GetClaimData[res.value]
                        if(DateColumnNames.includes(res.value)){
                            if(GetClaimData[res.value]){
                                value = moment(GetClaimData[res.value]).format("MM/DD/YYYY")
                            }else {
                                value = GetClaimData[res.value]
                            }
                        }
                        return <div className='col-6 fv-row mb-7'>
                            <label className='col-lg-12 fs-6'>
                                <span> {res.label} : </span>
                                {/*  */}
                                <span className='  fw-bold '>{Symbol} {value}</span>
                            </label>
                            
                            {/* <p ></p> */}
                            {/* <input value={GetClaimData[res.value]} type="text" readOnly name={res.value} id={res.value} className='form-control bg-gray-400i' /> */}
                        </div>
                    })
                }
            </div>
            <hr/>
            <h3>Claim History</h3>
            <hr/>
            <table id='kt_table_users' className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'>
                <thead>
                    <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Comments</th>
                        <th>Created Date</th>
                        <th>User</th>
                    </tr>

                </thead>
                <tbody className='text-gray-600 fw-bold' >

                    {
                        ClaimHistoryData.map((res: any, inde: any) => {

                            return (
                                <tr>
                                    <td >{res.StatusCode}</td>
                                    <td >{moment(res.DueDate).format("MM-DD-YYYY")}</td>
                                    <td >{res.Comments}</td>
                                    <td >{moment(res.createdAt).format("MM-DD-YYYY")}</td>
                                    <td>{res.FirstName}</td>
                                </tr>
                            )
                        })
                    }


                </tbody>
            </table>
        </div>


    )

}
export { ClaimDetails }