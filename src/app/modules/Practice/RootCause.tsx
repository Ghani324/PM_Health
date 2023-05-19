import React, { useState, useEffect, FC, ChangeEvent } from 'react'
import { DataGridPro, GridColDef, GridFilterModel, DataGridProProps, GridSortModel, GridRowParams, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, GridValueGetterParams, DataGrid } from '@mui/x-data-grid-pro';
import { UserDetails, UserDetailsDetails as initialValues } from '../SampleTemplate/models/template'
import * as Yup from 'yup'
import { useFormik, Field } from 'formik'


import axios from 'axios'
import Select from 'react-select';
import swal from "sweetalert"
import { TableStyles } from '../wizards/common/TableStyle';


const API_URL = process.env.REACT_APP_THEME_API_URL

const pmsystemUrl = `/api/pmsystem/getLineBasedPmList`
const getPracticeListt = `/api/practice/getPracticeListById`
const arScenario = `/api/ArScenario/lookup`
const filtertable = `/api/ArScenario/filtertable`
const options = [
    { value: "Select", label: "Select" },
    { value: "RootCauseCodes", label: "Root Cause" },
    { value: "statuscode", label: "Status Code" }
]

const RootCause: React.FC = () => {

    const columns: GridColDef[] = [
        { align: 'center', headerAlign: "center", field: 'label', headerName: 'Description', width: 600, },
        { align: 'center', headerAlign: "center", field: 'value', headerName: 'Label', width: 200, }

    ]

    const [data, setData] = useState<UserDetails>(initialValues)
    const [selected, setSelected] = useState('');
    const [description, setdescription] = useState('');
    const [label, setlabel] = useState('')
    const [radiotoggle, setradiotoggle] = useState()
    const [alldata, setalldata] = useState([])
    const [pageState, setPageState] = useState({

        pageSize: {
            page: 0,
            pageSize: 20
        }
    })

    const UserDetailsSchema = Yup.object().shape({

        pm_system: Yup.array().required('PM system is required'),
        practice_name: Yup.array().required('Practice Name is required'),

    })
    const [loading, setLoading] = useState(false)
    const formik = useFormik<UserDetails>({
        initialValues,
        validationSchema: UserDetailsSchema,

        onSubmit: async (values) => {

            setLoading(true)
            const updatedData = Object.assign(data, values)
            setData(updatedData)

        },

    })



    const handler = (selectedOption: any) => {
        setSelected(selectedOption.value)


    }

    const handlesubmit = async () => {
        const data = {
            root: selected,
            description: description,
            label: label


        }


        const response = await axios.post(arScenario, data).then(data => {

            if (data.data.Result) {


                swal({
                    title: '',
                    icon: "info",
                    text: `${data.data.Message}`,
                }).then((_res: any) => {

                })
            }




        }).catch()
    }
    const optionchange = async (e: any) => {
        setradiotoggle(e.target.value)


        axios.get(`${filtertable}?keyword=${e.target.value}`).then(data => {

            if (data.data.toggle === 'RootCauseCodes') {




                setalldata(data.data.data)


            }
            if (data.data.toggle === 'statuscode') {


                setalldata(data.data.data)
            }



        })



    }

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
                        <h3 className='fw-bolder m-0'>Create Lookup </h3>
                    </div>
                </div>

                <div id='kt_account_profile_details' className='collapse show'>
                    <form onSubmit={formik.handleSubmit} noValidate className='form'>
                        <div className='card-body border-top p-9'>
                            <div className='form-group row'>


                                <div className='col-sm-4 fv-row'>
                                    <label className='col-lg-4 col-form-label fw-bold fs-6'>
                                        <span className='required'> Select Type</span>
                                    </label><br />
                                    <Select maxMenuHeight={180} onChange={handler} id="pm_system" options={options} />


                                    {/* {formik.touched.pm_system && formik.errors.pm_system && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>{formik.errors.pm_system}</div>
                    </div>
                  )} */}
                                </div>
                                <div className="col-sm-4 fv-row">
                                    <label className='col-lg-4 col-form-label fw-bold fs-6 required' htmlFor="Label">Label</label>
                                    <input style={{ height: '38px' }} className="form-control" id="Label" value={label} name='label' onChange={(e) => { setlabel(e.target.value) }}></input>
                                </div>


                                <div className="col-sm-4 fv-row">
                                    <label className='col-lg-4 col-form-label fw-bold fs-6 required' htmlFor="Description">Description</label>
                                    <input style={{ height: '38px' }} className="form-control" id="Description" name='description' value={description} onChange={(e) => { setdescription(e.target.value) }}  ></input>
                                </div>
                                <div className="col-12 fv-row d-flex  justify-content-end mt-3" >
                                    <button type="submit" className="btn btn-primary btn-lg" onClick={handlesubmit}>Submit</button>

                                </div>
                                <div className=' col-lg-6 d-flex justify-content-around'>

                                    <div className="  form-check form-check-inline   ">
                                        <input className="form-check-input" type="radio" name="inlineRadioOptions" id="stauscode" value="statuscode" checked={radiotoggle === "statuscode"} onChange={optionchange} />
                                        <label className="form-check-label " htmlFor="payerwise">Status Code </label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="radio" name="inlineRadioOptions" id="rootcause" value="RootCauseCodes" checked={radiotoggle === "RootCauseCodes"} onChange={optionchange} />
                                        <label className="form-check-label" htmlFor="statuswiser">Root Cause</label>
                                    </div>




                                </div>
                                <div style={{ height: 500, width: "100%", fontSize: '25px' }} className="pt-10">

                                    {alldata.length > 0 ? < DataGridPro sx={TableStyles}
                                        checkboxSelection={true}

                                        paginationModel={{
                                            page: pageState.pageSize.page == 0 ? pageState.pageSize.page : pageState.pageSize.page,
                                            pageSize: pageState.pageSize.pageSize
                                        }}
                                        paginationMode="server"
                                        onPaginationModelChange={(newPageSize: any) => setPageState(old => ({ ...old, pageSize: newPageSize }))}
                                        pagination




                                        pageSizeOptions={[20, 40, 60, 80, 100]}

                                        getRowId={(row) => row._id}


                                        rows={alldata} columns={columns} />
                                        : null
                                    }
                                </div>

                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
export { RootCause }