import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

import { DataGridPro, GridColDef, GridFilterModel, DataGridProProps, GridSortModel, GridRowParams, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector,GridValueGetterParams } from '@mui/x-data-grid-pro';

import { useForm } from 'react-hook-form'
//import { DataGrid, gridClasses } from '@mui/x-data-grid';

import Button, { ButtonProps } from '@mui/material/Button';
import { createSvgIcon } from '@mui/material/utils';
import { useLocation } from 'react-router-dom'
import axios from "axios";
import Select from 'react-select';
import swal from "sweetalert"
import { KTSVG } from '../../../../_metronic/helpers'
import { userData } from "../common/StatusCode"
import { TableStyles } from "../common/TableStyle"
import {HideFooterButtons} from "../common/HideFooterButtons"
import { AgingOperators } from '../common/AgingOperator';
import {DateOperator} from "../common/DateOperator";
import { PriorityOperators } from '../common/PriorityOperator';
import { buttonBaseProps } from '../common/buttonBaseProp';
import { RootCauseCodes } from "../common/RootCauseCodes"
import moment from "moment-timezone"
import { Chart } from "react-google-charts";
import { useAuth } from '../../../../app/modules/auth'
import { UserDetailsDetails } from '../../UserManagment/models/UserModels';
import "../common/style.css";
const API_URL = process.env.REACT_APP_THEME_API_URL
const getClaims = `/api/Claims/getClaims`
const GetClaimOutstanding = `/api/Claims/GetClaimOutstanding`
const getUserList = `/users/getUsersList`
const getClaimHistory = `/api/Claims/getClaimHistory`
const ClaimUpdateUrl = `/api/Claims/ClaimUpdate`
const AssignClaimUser = `/api/Claims/AssignClaimUser`
const getPracticeList = `/api/practice/getPracticeListById`
const DeleteClaimHistoryById = `/api/Claims/DeleteClaimHistoryById`
const RootCause = `/api/ArScenario/rootcause`
const Status = `/api/ArScenario/status`
const UpdateColumnsByUser = `/api/Claims/UpdateColumnsByUser`
const getColumnsByUser = `/api/Claims/getColumnsByUser`
// const customStyles = {
//     menu: (provided: any, state: { selectProps: { menuColor: any; }; }) => ({
//         ...provided,
//         width: ' 500px!important',
//         borderBottom: '1px dotted pink',
//         color: state.selectProps.menuColor,
//     })
// }
const getPmList = `/api/pmsystem/getPmList`

function formatDate(date:any) {
    if(date){
        var d = new Date(date)
        d.setUTCHours(0,0,0)
        var month = '' + (d.getMonth() + 1)
        var day = '' + d.getDate()
        var year = d.getFullYear();

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;

        return [month,day,year,].join('-');
    }else {
        return ""
    }
    
}
const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});
  
const ViewClaim: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userDetails: any = location.state;
    const [selectedRows, setSelectedRows] = React.useState([]);
    const { currentUser }: any = useAuth()
    const [ClaimHistoryId, setClaimHistoryId] = React.useState("");
    const [CurrentPayerName, setCurrentPayerName] = React.useState("");
    const [formData, setFormData] = useState({
        FromDate: '',
        ToDate: '',
    });
    const [showModal, setshowModal] = React.useState("");
    const [fromType, setfromType] = React.useState("");
    const [duedate, setduedate] = React.useState("");
    const [Comments, setComments] = React.useState("");
    const [ClaimCurrentData, SetClaimCurrentData] = React.useState({ Bill: "" });
    const [ClaimHistoryData, setClaimHistoryData] = React.useState([]);
    const [showModalClaimhistory, setshowModalClaimhistory] = React.useState("");
    const [PracticeNameDatas, setdPracticeNameDatas] = useState([{ PracticeName: "", _id: "" }])
    const [UserNameDatas, setUserNameDatas] = useState([{ FirstName: "", _id: "" }])
    const [SelectedPmSystem, setSelectedPmSystem] = useState({})
    const [SelectedUserName, setSelectedUserName] = useState({ value: "", label: "" })
    const [SelectedPriority, setSelectedPriority] = useState({ value: "", label: "" })
    const [DefaultColumns, setDefaultColumns] = useState({ Bill: false, DateOfService: false, PatientName: false, PayerName: false, ClaimStatus: false, ClaimBilledAmount: false, ClaimPayment: false, ClaimBalance: false, Account: false, ProviderName: false, SystemStatus: false, Aging: false, DueDate: false, Comments: false, updatedAt: false, FirstName: false, Location: false, MemberId: false, PayerMix: false, IntialClaimDate: false, ClaimAdjustemnt: false, Stage: false, RoleResponsibilityCategory: false, DenialReason: false, ServiceType: false, RootCause: false, Modifier: false, PCAStatus: false, ProcedureCode: false, FacilityName: false, PayerResponsibility: false, Indication: false, ProcedureBalance: false, FiledStatus: false, PatientDOB: false, AdjustmentReason: false, CompanyName: false, OrginalICN: false, Diagnosis: false, SecondaryInsuranceCompany: false, DOE: false, Unit: false, ProcedureBilledAmount: false, ProcedurePayment: false, ProcedureAdjustment: false })

    const [SelectedPractice, setSelectedPractice] = useState([])
    const [PracticeListData, setPracticeListData] = useState([])
    const [getstatus, setstatus] = useState([{ type: "", label: "", value: "" }])
    const [getrootcause, setrootcause] = useState([{ type: "", label: "", value: "" }])

    const [SelectedValue, setSeSelectedValue] = React.useState({ label: "Select", value: "" })
    const [ChangeRootCause, setChangeRootCause] = React.useState({ label: "Select", value: "" })

    const [getPmListData, setdatas] = useState([{ PmName: "", _id: "" }])

    const [ChartOptions, setChartOtpions] = useState({
        title: "Aging Outstanding UnTouched",
        animation: {
            duration: 1500,
            startup: true
        },
        is3D: true,
        hAxis: {
          title: "Total",
          minValue: 0,
        },
        vAxis: {
          title: "Aging",
        },
    })
    const [ChartOptionsTouched, setChartOtpionsUnTouched] = useState({
        title: "Aging Outstanding Touched",
        animation: {
            duration: 1500,
            startup: true
        },
        is3D: true,
        hAxis: {
          title: "Total",
          minValue: 0,
        },
        vAxis: {
          title: "Aging",
        },
    })
    const [ChartData, setChartData] = useState([])
    const [ChartDataTouched, setChartDataTouched] = useState([])
    const { handleSubmit, formState } = useForm()
    const { isSubmitting } = formState
    function submitForm() {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve()
            }, 2000)
        })
    }

    const getstatuss = async () => {
        const getstatus = await axios.get(Status)
        if (getstatus.data) {
            setstatus(getstatus.data.data)
        }
    }

    const getrootcauses = async () => {
        const getrootcause = await axios.get(RootCause)
        if (getrootcause.data) {
            setrootcause(getrootcause.data.data)
        }
    }

    useEffect(() => {
        getstatuss()
        getrootcauses()
    }, [])

    const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
        items: [],
    });
    const [sortModel, setSortModel] = React.useState<GridSortModel>([
        {
            field: 'updatedAt',
            sort: 'desc',
        },
    ]);
    const [pageState, setPageState] = useState({
        isLoading: false,
        data: [],
        total: 0,
        pageSize: {
            page: 0,
            pageSize: 20
        }
        // page: 1,
        // pageSize: 20
    })
    const GetPmList = async () => {
        const getPmListData = await axios.get(getPmList)
        if (getPmListData.data) {

            setdatas(getPmListData.data.data)
        }
    }
    const handleExport = async (_e: any) => {
        var url = ""
        if (formData.FromDate && formData.ToDate) {
            var FilterModel: any = {
                items: [{
                    field: 'createdAt',
                    operator: 'Range',
                    value: `${formData.FromDate}Split${formData.ToDate}`
                }]
            }
            url = `${getClaims}?pmid=${JSON.stringify(SelectedPmSystem)}&practicelist=${JSON.stringify(SelectedPractice)}&page=${pageState.pageSize.page}&limit=${pageState.pageSize.pageSize}&filter=${JSON.stringify(FilterModel.items)}&type=download&sort=${JSON.stringify(sortModel)}`
        } else {
            url = `${getClaims}?pmid=${JSON.stringify(SelectedPmSystem)}&practicelist=${JSON.stringify(SelectedPractice)}&page=${pageState.pageSize.page}&limit=${pageState.pageSize.pageSize}&filter=${JSON.stringify(filterModel.items)}&type=download&sort=${JSON.stringify(sortModel)}`
        }
        axios.get(url,{responseType: 'arraybuffer',}).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Claims-${moment().format("YYYYMMDDhms")}.xlsx`);
            document.body.appendChild(link);
            link.click();
        }).catch((error) => console.log(error));
    }
    const CustomToolBar = () => {

        return (<GridToolbarContainer>

            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <Button
                {...buttonBaseProps}
                onClick={(e) => handleExport(e)}
            >Export</Button>
        </GridToolbarContainer>
        );
    }
    const fetchData = async (GetData: any) => {



        if (userDetails) {
            setSelectedPmSystem(userDetails.SelectedData[0].SelectedPmSystem)
            setSelectedPractice(userDetails.SelectedData[0].SelectedPractice)
            setSelectedPractice(userDetails.SelectedData[0].SelectedPractice)
            //setPageState(old => ({ ...old, page: userDetails.SelectedData[0].page }))
            setPageState(old => ({
                ...old, pageSize: {
                    pageSize: userDetails.SelectedData[0].pageSize,
                    page: userDetails.SelectedData[0].page
                }
            }))
            var FilterModel: any = { items: userDetails.SelectedData[0].filterModel }
            setFilterModel(FilterModel)
            setSortModel(userDetails.SelectedData[0].sortModel)
            navigate("/ViewClaim", { replace: true });
        }

        setPageState(old => ({ ...old, isLoading: true }))

        const GetChartData = await axios.get(`${GetClaimOutstanding}?pmid=${JSON.stringify(SelectedPmSystem)}&practicelist=${JSON.stringify(GetData)}`)

        var GetChartDataDB = GetChartData.data.data
        var CahrtDataTouched = GetChartData.data.CahrtDataTouched
        setChartData(GetChartDataDB)
        setChartDataTouched(CahrtDataTouched)
        console.log("filterModel", filterModel)
        if (formData.FromDate && formData.ToDate) {
            var FilterModel: any = {
                items: [{
                    field: 'createdAt',
                    operator: 'Range',
                    value: `${formData.FromDate}Split${formData.ToDate}`
                }]
            }
            var Result = await axios.get(`${getClaims}?pmid=${JSON.stringify(SelectedPmSystem)}&practicelist=${JSON.stringify(GetData)}&page=${pageState.pageSize.page}&limit=${pageState.pageSize.pageSize}&filter=${JSON.stringify(FilterModel.items)}&type=view&sort=${JSON.stringify(sortModel)}`)
            setPageState(old => ({ ...old, isLoading: false, data: Result.data.data, total: Result.data.total }))
        } else {
            var Result = await axios.get(`${getClaims}?pmid=${JSON.stringify(SelectedPmSystem)}&practicelist=${JSON.stringify(GetData)}&page=${pageState.pageSize.page}&limit=${pageState.pageSize.pageSize}&filter=${JSON.stringify(filterModel.items)}&type=view&sort=${JSON.stringify(sortModel)}`)
            setPageState(old => ({ ...old, isLoading: false, data: Result.data.data, total: Result.data.total }))
        }
    }
    const GetUsersList = async () => {
        const Result = await axios.get(getUserList)
        setUserNameDatas(Result.data.data)
    }
    const getSelectedColumns = async () => {
        const getUserColumns = await axios.get(`${getColumnsByUser}?PageType=ViewClaims`)
        var getDefaultColumns = getUserColumns.data.data
        if (getUserColumns.data.data && Object.keys(getUserColumns.data.data).length > 0) {
            setDefaultColumns(getDefaultColumns)
        }
    }

    useEffect(() => {
        getSelectedColumns()
        GetUsersList()
        GetPmList()
    }, [])
    useEffect(() => {
        fetchData(SelectedPractice)
    }, [pageState.pageSize.page, pageState.pageSize.pageSize, filterModel.items, sortModel])

    const columns: GridColDef[] = [
        {
            align: 'center', headerAlign: "center", field: 'Priority', filterOperators: PriorityOperators, type: "number", headerName: 'Priority', width: 80, editable: true, renderCell: ({ row }: Partial<GridRowParams>) =>
                <>{row.Priority === 1 ? <><KTSVG path='/media/icons/duotune/abstract/abs050.svg' className='svg-icon-1' /></> : <><KTSVG path='/media/icons/duotune/abstract/abs053.svg' className='svg-icon-1' /></>} </>
        },
        {
            align: 'center', headerAlign: "center",
            field: 'Bill', headerName: 'Claim#', width: 150, editable: true, renderCell: ({ row }: Partial<GridRowParams>) =>
                <a href="#" className='' onClick={() => ViewClaimDetails(row)}>
                    {row.Bill}
                </a>
        },

        { filterOperators: DateOperator, align: 'center', headerAlign: "center", field: 'DateOfService', headerName: 'Service Date', width: 150, type: "text", renderCell: ({ row }: Partial<GridRowParams>) => <>{moment(row.DateOfService).tz("America/florida").format("MM-DD-YYYY")}</> },

        {
            align: 'center', headerAlign: "center", field: 'PatientName', headerName: 'Patient Name', width: 200, renderCell: ({ row }: Partial<GridRowParams>) =>
                <a href="#" className='' onClick={() => navigateViewClaimbyid(row)}>
                    {row.PatientName}
                </a>
        },
        { align: 'center', headerAlign: "center", field: 'PayerName', headerName: 'Payer', width: 200, },
        { align: 'center', headerAlign: "center", field: 'ClaimStatus', headerName: 'Claim Status', width: 150, },
        { valueFormatter: ({ value }) => currencyFormatter.format(value),align: 'center', headerAlign: "center", field: 'ClaimBilledAmount', headerName: 'Charges ($)', width: 100, type: "number" },
        { valueFormatter: ({ value }) => currencyFormatter.format(value),align: 'center', headerAlign: "center", field: 'ClaimPayment', headerName: 'PMTS/ADJS ($)', width: 100, type: "number" },
        { valueFormatter: ({ value }) => currencyFormatter.format(value),align: 'center', headerAlign: "center", field: 'ClaimBalance', headerName: 'Balance ($)', width: 100, type: "number" },
        {
            align: 'center', headerAlign: "center", field: 'Account', headerName: 'Account Number', width: 100, renderCell: ({ row }: Partial<GridRowParams>) =>
                <a href="#" className='' onClick={() => navigateViewClaimbyAccount(row)}>
                    {row.Account}
                </a>
        },
        { align: 'center', headerAlign: "center", field: 'ProviderName', headerName: 'Provider Name', width: 200, },
        { align: 'center', headerAlign: "center", field: 'SystemStatus', headerName: 'Status', width: 200, },
        { align: 'center', headerAlign: "center", field: 'Location', headerName: 'Location', width: 200, },
        { align: 'center', headerAlign: "center", field: 'MemberId', headerName: 'Member ID', width: 200, },
        { align: 'center', headerAlign: "center", field: 'PayerMix', headerName: 'Payer Mix', width: 200, },
        { filterOperators: DateOperator, align: 'center', headerAlign: "center", field: 'IntialClaimDate', headerName: 'Intial Claim Date', width: 150, type: "text", renderCell: ({ row }: Partial<GridRowParams>) => <>{moment(row.IntialClaimDate).tz("America/florida").format("MM-DD-YYYY")}</> },
        { align: 'center', headerAlign: "center", field: 'ClaimAdjustemnt', headerName: 'Adjustment ($)', width: 200, },
        { align: 'center', headerAlign: "center", field: 'Stage', headerName: 'Stage', width: 200, },
        { align: 'center', headerAlign: "center", field: 'RoleResponsibilityCategory', headerName: 'Role', width: 200, },
        { align: 'center', headerAlign: "center", field: 'DenialReason', headerName: 'DenialReason', width: 200, },
        { align: 'center', headerAlign: "center", field: 'ServiceType', headerName: 'ServiceType', width: 200, },
        { align: 'center', headerAlign: "center", field: 'RootCause', headerName: 'Root Cause', width: 200, },
        { align: 'center', headerAlign: "center", field: 'Modifier', headerName: 'Modifier', width: 200, },
        { align: 'center', headerAlign: "center", field: 'ProcedureCode', headerName: 'ProcedureCode', width: 200, },
        { align: 'center', headerAlign: "center", field: 'FacilityName', headerName: 'FacilityName', width: 200, },
        { align: 'center', headerAlign: "center", field: 'PayerResponsibility', headerName: 'PayerResponsibility', width: 200, },
        { align: 'center', headerAlign: "center", field: 'Indication', headerName: 'Indication', width: 200, },
        { align: 'center', headerAlign: "center", field: 'ProcedureBalance', headerName: 'ProcedureBalance ($)', width: 200, },
        { align: 'center', headerAlign: "center", field: 'FiledStatus', headerName: 'FiledStatus', width: 200, },
        { align: 'center', headerAlign: "center", field: 'PatientDOB', headerName: 'PatientDOB', width: 200, },
        { align: 'center', headerAlign: "center", field: 'AdjustmentReason', headerName: 'AdjustmentReason', width: 200, },
        { align: 'center', headerAlign: "center", field: 'CompanyName', headerName: 'CompanyName', width: 200, },
        { align: 'center', headerAlign: "center", field: 'OrginalICN', headerName: 'OrginalICN', width: 200, },
        { align: 'center', headerAlign: "center", field: 'Diagnosis', headerName: 'Diagnosis', width: 200, },
        { align: 'center', headerAlign: "center", field: 'SecondaryInsuranceCompany', headerName: 'SecondaryInsuranceCompany', width: 200, },
        { align: 'center', headerAlign: "center", field: 'DOE', headerName: 'DOE', width: 200, },
        { align: 'center', headerAlign: "center", field: 'Unit', headerName: 'Unit', width: 200, },
        { align: 'center', headerAlign: "center", field: 'ProcedureBilledAmount', headerName: 'ProcedureBilledAmount', width: 200, },
        { align: 'center', headerAlign: "center", field: 'ProcedurePayment', headerName: 'ProcedurePayment ($)', width: 200, },
        { align: 'center', headerAlign: "center", field: 'ProcedureAdjustment', headerName: 'ProcedureAdjustment ($)', width: 200, },
        {
            align: 'center', headerAlign: "center", field: 'Aging', filterOperators: AgingOperators, type: "number", headerName: 'Aging', width: 200,
        },
        { filterOperators: DateOperator,align: 'center', headerAlign: "center", field: 'DueDate', type: 'text', headerName: 'Due Date', width: 200, renderCell: ({ row }: Partial<GridRowParams>) => <>{row.DueDate ? moment(row.DueDate).tz("America/florida").format("MM-DD-YYYY") :  ""}</> },

        {
            align: 'center', headerAlign: "center", field: 'Comments', headerName: 'Comments', width: 200, renderCell: ({ row }: Partial<GridRowParams>) =>
                <a href="#" title={row.Comments} className='' onClick={() => ViewClaimHistory(row)}>
                    {row.Comments}
                </a>,
        },
        {
            filterOperators: DateOperator,align: 'center', headerAlign: "center", field: 'updatedAt', type: 'text', headerName: 'Last Worked Date', width: 200, renderCell: ({ row }: Partial<GridRowParams>) => <>{
                row.updatedAt ? moment(row.updatedAt).tz("America/florida").format("MM-DD-YYYY") : ""}</>
        },
        {
            align: 'center', headerAlign: "center", field: 'FirstName', headerName: 'Updated By', width: 200, renderCell: ({ row }: Partial<GridRowParams>) =>
                <>
                    {row.FirstName ? row.FirstName + " " + row.LastName : ""}
                </>,
        },
    ]

    const onRowsSelectionHandler = (ids: any) => {
        console.log("ids", ids)
        const selectedRowsData = ids.map((id: any) => pageState.data.find((row: any) => row.id === id));
        setSelectedRows(selectedRowsData)

    };
    const EditForm = (res: any) => {

        if (currentUser.PermissionsList[6].value) {

            var a = moment(new Date())//now
            var b = res.updatedAt;
            var hours = a.diff(b, 'hours')
            if (hours <= 8) {

            } else {
                swal({
                    title: 'Date Invalid',
                    icon: "error",
                    text: `User Not allowed to Edit comment after 8 hours`,
                }).then((_res: any) => {

                })
                return false;
            }
        }

        setClaimHistoryId(res._id)
        if (res.DueDate) {
            setduedate(moment(res.DueDate).format("YYYY-MM-DD"))
        }
        if (res.Comments) {
            setComments(res.Comments)
        }
        if (res.StatusCode) {
            var getStatus = getstatus.filter((s, sidx) => s.value === res.StatusCode)
            setSeSelectedValue(getStatus[0])
        }
        setshowModalClaimhistory("")
        setfromType("")
        setshowModal("show d-block")
        setfromType("Update Data")
    }
    const deleteLine = (res: any) => {
        setClaimHistoryId(res._id)
        if (currentUser.PermissionsList[6].value) {

            var a = moment(new Date())//now
            var b = res.updatedAt;
            var hours = a.diff(b, 'hours')
            if (hours <= 8) {

            } else {
                swal({
                    title: 'Date Invalid',
                    icon: "error",
                    text: `User Not allowed to Delete comment after 8 hours`,
                }).then((_res: any) => {

                })
                return false;
            }
        }
        swal({
            title: 'Are you sure?',
            icon: "error",
            text: `You want to Delete`,
            buttons: [
                'No, cancel it!',
                'Yes, I am sure!'
            ],
            //dangerMode: true,
        }).then(async (_resss: any) => {

            var PostData = {
                ClaimHistoryId: ClaimHistoryId,
            }
            if (_resss) {
                axios.post(DeleteClaimHistoryById, PostData).then(async (_res) => {

                    const Result = await axios.get(`${getClaimHistory}?ClaimId=${res.ClaimId}`)

                    setClaimHistoryData(Result.data.data)

                    setshowModalClaimhistory("show d-block")
                    setfromType("View Claim History")

                    swal({
                        title: 'Success',
                        icon: "success",
                        text: `Selected Comment Delete Successfully...!`,
                    }).then((_res: any) => {

                    })
                })
            }
        })
    }
    const handleChange = (_event: any) => {
        setshowModal("show d-block")
        setfromType("Update Data")
    };
    const navigateViewClaimbyid = async (ids: any) => {
        console.log("ids", ids)
        navigate('/ClaimsViewbyid', {
            state: {
                SelectedData: [{
                    SelectedPmSystem: SelectedPmSystem,
                    SelectedPractice: SelectedPractice,
                    page: pageState.pageSize.page,
                    pageSize: pageState.pageSize.pageSize,
                    filterModel: filterModel.items,
                    sortModel : sortModel
                }],
                data: ids.PatientName,
                Type: "PatientName",
                PracticeId: ids.PracticeId,
                PageType: "ViewClaim"
            }
        })
    };
    const navigateViewClaimbyAccount = async (ids: any) => {
        navigate('/ClaimsViewbyid', {
            state: {
                SelectedData: [{
                    SelectedPmSystem: SelectedPmSystem,
                    SelectedPractice: SelectedPractice,
                    page: pageState.pageSize.page,
                    pageSize: pageState.pageSize.pageSize,
                    filterModel: filterModel.items,
                    sortModel : sortModel
                }],
                data: ids.Account,
                Type: "Account",
                PracticeId: ids.PracticeId,
                PageType: "ViewClaim"
            }
        })
    };
    const handleInputChange = async (event: any) => {
        const { name, value } = event.target;
        await setFormData((prevState) => {
            return { ...prevState, [name]: value, }
        });
    }
    const Filter = async (ids: any) => {

        if (!formData.FromDate) {
            swal({
                title: 'Date',
                icon: "info",
                text: `Please choose From Date`,
            }).then((_res: any) => {

            })
            return false;
        }
        if (!formData.ToDate) {
            swal({
                title: 'Date',
                icon: "info",
                text: `Please choose To Date`,
            }).then((_res: any) => {

            })
            return false;
        }
        var FilterModel: any = {
            items: [{
                field: 'createdAt',
                operator: 'Range',
                value: `${formData.FromDate}Split${formData.ToDate}`
            }]
        }
        const Result = await axios.get(`${getClaims}?pmid=${JSON.stringify(SelectedPmSystem)}&practicelist=${JSON.stringify(SelectedPractice)}&page=${pageState.pageSize.page}&limit=${pageState.pageSize.pageSize}&filter=${JSON.stringify(FilterModel.items)}&type=view&sort=${JSON.stringify(sortModel)}`)

        setPageState(old => ({ ...old, isLoading: false, data: Result.data.data, total: Result.data.total }))
    }
    const ClearFilter = async (ids: any) => {

        await setFormData((prevState) => {
            return { ...prevState, FromDate: "", ToDate: "" }
        });
        fetchData(SelectedPractice)
    }
    const ViewClaimDetails = async (ids: any) => {

        navigate('/ClaimDetails', {
            state: {
                SelectedData: [{
                    SelectedPmSystem: SelectedPmSystem,
                    SelectedPractice: SelectedPractice,
                    page: pageState.pageSize.page,
                    pageSize: pageState.pageSize.pageSize,
                    filterModel: filterModel.items,
                    sortModel : sortModel
                }],
                data: ids._id,
                Type: "Claim No",
                PracticeId: ids.Bill
            }
        })
    }
    const ViewClaimHistory = async (ids: any) => {
        SetClaimCurrentData(ids)
        const Result = await axios.get(`${getClaimHistory}?ClaimId=${ids._id}`)

        setClaimHistoryData(Result.data.data)
        if (Result.data.data.RootCause) {
            setChangeRootCause({ label: Result.data.data.RootCause, value: Result.data.data.RootCause })
        }
        setshowModalClaimhistory("show d-block")
        setfromType("View Claim History")
    };

    const CloseModal = (_event: any) => {
        setClaimHistoryData([])
        setshowModalClaimhistory("")
        setfromType("")
        setshowModal("")
        setfromType("")
        setduedate("")
        setComments("")
        setChangeRootCause({ label: "Select", value: "" })
        setSeSelectedValue({ label: "Select", value: "" })
    }
    const handleChangeUser = (event: any) => {
        setSeSelectedValue(event)
    };
    const handleChangeRootCause = (event: any) => {
        setChangeRootCause(event)
    };

    const handleMouseLeaveInput = (event: any) => {
        if (event.target.value) {
            if (event.target.name === "duedate") {
                if (event.target.value >= moment().format("YYYY-MM-DD")) {
                    setduedate(event.target.value)
                } else {
                    setduedate("")
                    swal({
                        title: 'Date Invalid',
                        icon: "error",
                        text: `One Field Mandatory`,
                    }).then((_res: any) => {

                    })
                }
            }
        }
    };
    const handleChangeInput = (event: any) => {

        if (event.target.name === "duedate") {
            // if (event.target.value >= moment().format("YYYY-MM-DD")) {
            setduedate(event.target.value)
            // } else {
            //     setduedate("")
            //     swal({
            //         title: 'Date Invalid',
            //         icon: "error",
            //         text: `One Field Mandatory`,
            //     }).then((_res: any) => {

            //     })
            // }

        }
        if (event.target.name === "Comments") {
            setComments(event.target.value)
        }
    };
    const AssignClaims = async () => {

        var CheckEmpty :any = []
        var CheckCallStatus :any = []
        var StatusCodesCheck = ["CALL","Fresh-Call","RECALL","MRV"]
        selectedRows.map((res:any,ind:any)=>{
            if(!res.SystemStatus){
                CheckEmpty.push(ind)
            }
            if(!StatusCodesCheck.includes(res.SystemStatus)){
                CheckCallStatus.push(ind)
            }
        })
        if(CheckEmpty.length > 0){
            swal({
                title: '',
                icon: "info",
                text: `Status Must be Call / Fresh-Call / RECALL / MRV`,
            }).then((_res: any) => {

            })
            return false;
        }
        if(CheckCallStatus.length > 0){
            swal({
                title: '',
                icon: "info",
                text: `Status Must be Call / Fresh-Call / RECALL / MRV`,
            }).then((_res: any) => {

            })
            return false;
        }
        var PostData = {
            ClaimLines: JSON.stringify(selectedRows),
            UserName: SelectedUserName.value,
            Priority: SelectedPriority.value
        }
        if (Object.keys(selectedRows).length > 0 && SelectedUserName.value) {

            axios.post(AssignClaimUser, PostData).then(_res => {

                swal({
                    title: 'Success',
                    icon: "success",
                    text: `Claim Assign Successfully... User ${SelectedUserName.label}`,
                }).then((_res: any) => {

                })

            })
        } else {
            swal({
                title: 'Failure',
                icon: "error",
                text: `One Field Mandatory`,
            }).then((_res: any) => {

            })
        }

    }
    const SubmitForm = () => {

        var PostData = {
            ClaimHistoryId: ClaimHistoryId,
            ClaimLines: JSON.stringify(selectedRows),
            duedate: duedate,
            Comments: Comments,
            StatusCode: SelectedValue,
            ChangeRootCause: ChangeRootCause
        }
        if (currentUser.RoleType == "AR-Caller") {
            if (!ChangeRootCause.value) {
                swal({
                    title: 'Required Field',
                    icon: "error",
                    text: `Please choose the Roost Cause`,
                })
            }
            return false;
        }

        if (duedate || Comments || SelectedValue.value || ChangeRootCause.value) {

            axios.post(ClaimUpdateUrl, PostData).then(_res => {

                swal({
                    title: 'Success',
                    icon: "success",
                    text: `Updated Successfully...`,
                }).then((_res: any) => {
                    fetchData(SelectedPractice)
                    setshowModal("")
                    setfromType("")
                    setduedate("")
                    setComments("")
                    setSeSelectedValue({ label: "Select", value: "" })
                })

            })
        } else {
            swal({
                title: 'Failure',
                icon: "error",
                text: `One Field Mandatory`,
            }).then((_res: any) => {

            })
        }

    }
    const getPractice = (event: any) => {

        if (Object.keys(event).length > 0) {
            setSelectedPractice(event)
            fetchData(event)

        } else {
            setSelectedPractice([])
            setChartData([])
        }

    }
    const setColumnVisibilityModel = (e: any) => {
        setDefaultColumns(e)
        axios.post(UpdateColumnsByUser, { Columns: JSON.stringify([e]), PageType: "ViewClaims" }).then((res) => {
            console.log("res", res.data)
        })
    }
    const getPMSystem = (event: any) => {
        //setSelectedPractice([])
        setSelectedPmSystem(event)
        if (event.value) {
            axios.post(getPracticeList, { PostData: event.value }).then((res) => {
                setPracticeListData(res.data.data)
            })
        }

    };
    const getUserName = (event: any) => {
        //setSelectedPractice([])
        setSelectedUserName(event)
    };
    const getPriority = (event: any) => {
        //setSelectedPractice([])
        setSelectedPriority(event)
    };

    var PmListData = [{ label: "Select", value: "" }]
    getPmListData.map((name) => (
        PmListData.push({
            label: name.PmName,
            value: name._id
        })
    ))
    var UsersListData = [{ label: "Select", value: "" }]
    UserNameDatas.map((userList, index) => {
        UsersListData.push({
            label: userList.FirstName,
            value: userList._id
        })
    })

    var statuslistdata = [{ label: "", value: "" }]
    getstatus.map((name) => (
        statuslistdata.push({
            label: name.label,
            value: name.value
        })
    )
    )
    var rootlistdata = [{ label: "", value: "" }]
    getrootcause.map((name) => (
        rootlistdata.push({
            label: name.label,
            value: name.value
        })
    ))

        console.log("pageState",pageState)
    return (
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
                    <h3 className='fw-bolder m-0'>View Claims</h3>
                </div>
            </div>
            <hr />
            <div className='row'>
                <div className='col-sm-4 fv-row'>
                    <label className='col-lg-4 col-form-label fw-bold fs-6'>
                        <span className='required'>PM System</span>
                    </label><br />
                    <Select maxMenuHeight={180} value={SelectedPmSystem} onChange={getPMSystem} id="PmSystem" name={"PmSystem"} options={PmListData} />

                </div>
                <div className='col-sm-4 fv-row'>
                    <label className='col-lg-6 col-form-label fw-bold fs-6'>
                        <span className='required'>Practice Name</span>
                    </label>

                    <Select maxMenuHeight={180} value={SelectedPractice} isMulti onChange={getPractice} id="Practice" name={"Practice"} options={PracticeListData} />


                </div>

                {/* <div className='col-3'>
                    <label className='col-lg-4 col-form-label fw-bold fs-6'>
                        <span>From Date</span>
                    </label>
                    <input max={new Date().toISOString().split('T')[0]} onChange={handleInputChange} type="date" value={formData.FromDate} name="FromDate" id="FromDate" className='form-control' />
                </div>
                <div className='col-3'>
                    <label className='col-lg-4 col-form-label fw-bold fs-6'>
                        <span>To Date</span>
                    </label>
                    <input max={new Date().toISOString().split('T')[0]} onChange={handleInputChange} type="date" value={formData.ToDate} name="ToDate" id="ToDate" className='form-control' />
                </div>
                <div className='col-1 pt-13'>
                    <button onClick={(e) => { Filter(e) }} className='btn btn-primary'  >Filter</button>
                </div>
                <div className='col-1 pt-13'>
                    <button onClick={(e) => { ClearFilter(e) }} className='btn btn-primary'  >Clear</button>
                </div> */}
                {/* <div className='col-sm-4 fv-row p-10'>
                    <button disabled={Object.keys(SelectedPractice).length > 0 ? false : true} onClick={handleChange} className='btn btn-primary'  >View Claims</button>
                </div> */}

            </div>

            {Object.keys(ChartData).length > 0 ?
                <>
                    <hr />
                    <Chart
                        chartType="BarChart"
                        width="100%"
                        height="200px"
                        data={ChartData}
                        options={ChartOptions}
                    /></>

                : null
            }
<hr />
        {Object.keys(ChartDataTouched).length > 0 ?
                <>
                    <hr />
                    <Chart
                        chartType="BarChart"
                        width="100%"
                        height="200px"
                        data={ChartDataTouched}
                        options={ChartOptionsTouched}
                    /></>

                : null
            }
            <hr />


                    <div className='row'>
                        <h4 className='text-center'>Assign Claim</h4>
                        <div className='col-sm-4 fv-row'>
                            <label className='col-lg-4 col-form-label fw-bold fs-6'>
                                <span className='required'>Assign To</span>
                            </label>
                            <Select maxMenuHeight={180} value={SelectedUserName} onChange={getUserName} id="UserName" name={"UserName"} options={UsersListData} />
                        </div>
                        <div className='col-sm-4 fv-row'>
                            <label className='col-lg-6 col-form-label fw-bold fs-6'>
                                <span className='required'>Set Priority</span>
                            </label>
                            <Select maxMenuHeight={180} value={SelectedPriority} onChange={getPriority} id="Priority" name={"Priority"} options={[{ label: "High", value: "1" }, { label: "Normal", value: "0" }]} />
                        </div>
                        <div className='col-sm-4 fv-row'>
                            <br /><br />
                            {/* <button disabled={selectedRows.length > 0 && SelectedUserName.value ? false : true} onClick={AssignClaims} className='btn btn-primary'  >Assign Claims</button> */}

                            <form onSubmit={handleSubmit(submitForm)}>
                                <div>
                                    <button disabled={selectedRows.length > 0 && SelectedUserName.value ? false : true} onClick={AssignClaims} className="btn btn-primary">
                                        {isSubmitting && (
                                            <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                                        )}
                                        Assign Claims
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                   
                {Object.keys(pageState.data).length > 0 ?  <> <hr /> </> : null}

            
               

                    <div className='row'>
                        <div className='col-3 mt-6'>
                            <button disabled={selectedRows.length > 0 ? false : true} onClick={handleChange} className='btn btn-primary'  >Update Comments / Due Date / Status</button>
                        </div>

                    </div>
                

            {Object.keys(pageState.data).length > 0 ?  <> <hr /> </> : null}
            <div style={{ height: 500, width: "100%", }} className="pt-10">
                <DataGridPro
                    sx={TableStyles}
                    componentsProps={HideFooterButtons}
                    checkboxSelection={true}
                    onRowSelectionModelChange={(ids: any) => onRowsSelectionHandler(ids)}

                    autoHeight={false}
                    rows={pageState.data}
                    rowCount={pageState.total}
                    loading={pageState.isLoading}
                    pageSizeOptions={[20, 40, 60, 80, 100]}
                    // page={pageState.page - 1}
                    // pageSize={pageState.pageSize}
                    paginationModel={{
                        page: pageState.pageSize.page == 0 ? pageState.pageSize.page : pageState.pageSize.page,
                        pageSize: pageState.pageSize.pageSize
                    }}
                    paginationMode="server"
                    // onPageChange={(newPage: number) => {
                    //     setPageState(old => ({ ...old, page: newPage + 1 }))
                    // }}
                    // onPageSizeChange={(newPageSize: any) => setPageState(old => ({ ...old, pageSize: newPageSize }))}

                    onPaginationModelChange={(newPageSize: any) => setPageState(old => ({ ...old, pageSize: newPageSize }))}
                    pagination
                    columns={columns}
                    filterModel={filterModel}
                    onColumnVisibilityModelChange={(newModel: any) => setColumnVisibilityModel(newModel)}
                    onSortModelChange={(model: any) => setSortModel(model)}
                    columnVisibilityModel={DefaultColumns}
                    // initialState={{
                    //     columns: {
                    //         columnVisibilityModel: DefaultColumns,
                    //     },
                    // }}
                    components={{ Toolbar: CustomToolBar }}

                    sortModel={sortModel}
                    onFilterModelChange={(newFilterModel: React.SetStateAction<GridFilterModel>) => setFilterModel(newFilterModel)}
                />
            </div>
           
            <div className={`modal fade ${showModal}`} id='kt_modal_add_user' role='dialog' tabIndex={-1} aria-modal='false' >
                <div className='modal-dialog modal-dialog-centered modal-xl'>
                    <div className='modal-content'>
                        <div className='modal-header'>

                            <h2 className='fw-bolder'>{fromType}</h2>

                            <div
                                onClick={CloseModal}
                                className='btn btn-icon btn-sm btn-active-icon-primary'
                                data-kt-users-modal-action='close'
                                style={{ cursor: 'pointer' }}
                            >
                                <KTSVG path='/media/icons/duotune/arrows/arr061.svg' className='svg-icon-1' />
                            </div>

                        </div>
                        <div className='modal-body scroll-y mx-5 mx-xl-15 my-7'>
                            <form id='kt_modal_add_user_form' className='form' noValidate>
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
                                                <span>Due Date</span>
                                            </label>
                                            <input min={new Date().toISOString().split('T')[0]} onMouseLeave={handleMouseLeaveInput} onChange={handleChangeInput} type="date" value={duedate} name="duedate" id="duedata" className='form-control' />


                                        </div>

                                        <div className='col-6 fv-row mb-7'>
                                            <label className='col-lg-4 col-form-label fw-bold fs-6'>
                                                <span>Status</span>
                                            </label>

                                            <Select maxMenuHeight={180} value={SelectedValue} onChange={handleChangeUser} id="Status" name={"Status"} options={statuslistdata} />

                                        </div>

                                        <div className='col-6 fv-row mb-7'>
                                            <label className='col-lg-4 col-form-label fw-bold fs-6'>
                                                <span>Comments</span>
                                            </label>
                                            <textarea onChange={handleChangeInput} value={Comments} className='form-control' id="Comments" name="Comments"></textarea>


                                        </div>
                                        <div className='col-6 fv-row mb-7'>
                                            <label className='col-lg-4 col-form-label fw-bold fs-6'>
                                                <span>Root Cause</span>
                                            </label>
                                            <Select maxMenuHeight={180} value={ChangeRootCause} onChange={handleChangeRootCause} id="RootCause" name={"RootCause"} options={rootlistdata} />
                                        </div>



                                    </div>
                                </div>
                                <div>

                                </div>
                                <div className='text-center pt-15'>
                                    <button type='button' onClick={SubmitForm} className='btn btn-primary' >Submit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>



            <div className={`modal fade ${showModalClaimhistory}`} id='kt_modal_add_user' role='dialog' tabIndex={-1} aria-modal='false' >
                <div className='modal-dialog modal-dialog-centered modal-xl'>
                    <div className='modal-content'>
                        <div className='modal-header'>

                            <h2 className='fw-bolder'>{fromType}</h2>
                            <b>Claim No : {ClaimCurrentData.Bill}</b>
                            <div
                                onClick={CloseModal}
                                className='btn btn-icon btn-sm btn-active-icon-primary'
                                data-kt-users-modal-action='close'
                                style={{ cursor: 'pointer' }}
                            >
                                <KTSVG path='/media/icons/duotune/arrows/arr061.svg' className='svg-icon-1' />
                            </div>

                        </div>
                        <div className='modal-body scroll-y mx-5 mx-xl-15 my-7'>

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
                                        ClaimHistoryData.map((res: any, _inde: any) => {

                                            return (
                                                <tr>
                                                    <td >{res.StatusCode}</td>
                                                    <td >{moment(res.DueDate).tz("America/florida").format("MM-DD-YYYY")}</td>
                                                    <td >{res.Comments}</td>
                                                    <td >{moment(res.createdAt).tz("America/florida").format("MM-DD-YYYY")}</td>
                                                    <td>{res.FirstName}</td>
                                                    <td>

                                                        <a href="#" onClick={() => EditForm(res)}  ><KTSVG path='/media/icons/duotune/art/art005.svg' className='svg-icon-2 svg-icon-gray-500' /></a>


                                                        <a href="#" onClick={() => deleteLine(res)}  ><KTSVG path='/media/icons/duotune/art/art011.svg' className='svg-icon-2 svg-icon-gray-500' /></a>

                                                    </td>

                                                </tr>
                                            )
                                        })
                                    }


                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {showModal ? <div className='modal-backdrop fade show'></div> : null}

        </div>


    )

}
export { ViewClaim }