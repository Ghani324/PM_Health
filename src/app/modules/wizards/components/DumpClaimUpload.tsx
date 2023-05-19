import { FC, useEffect, useRef, useState } from 'react'
import { Step1 } from './steps/Step1'
import { Step2 } from './steps/Step2'
import { Step3 } from './steps/Step3'
import { KTSVG } from '../../../../_metronic/helpers'
import { StepperComponent } from '../../../../_metronic/assets/ts/components'
import {PageLoading} from '../common/PageLoading'

import { Formik } from 'formik'
import { createAccountSchemas, ICreateAccount, inits } from './CreateAccountWizardHelper'
import axios from 'axios'
import swal from "sweetalert"
//import Swal from 'sweetalert2';
const API_URL = process.env.REACT_APP_THEME_API_URL

const pmsystemUrl = `/api/pmsystem/getPmListById`
const ClaimsDumpUpload = `/api/Claims/ClaimsDumpUpload`

// const Toast = Swal.mixin({
//   toast: true,
//   position: 'top-end',
//   showConfirmButton: false,
//   confirmButtonColor: '#0062bd',
//   timer: 10000
// })

const DumpClaimUpload: FC = () => {
  const stepperRef = useRef<HTMLDivElement | null>(null)
  const stepper = useRef<StepperComponent | null>(null)
  const [currentSchema, setCurrentSchema] = useState(createAccountSchemas[0])
  const [initValues] = useState<ICreateAccount>(inits)
  const [isSubmitButton, setSubmitButton] = useState(false)
  const [PmSystem_id, setdatas] = useState([{}])
  const [childData, setChildData] = useState("");
  const [ErrorDataMismatchTemplate, setErrorDataMismatchTemplate] = useState([]);
  const [SuccessFileNames, setSuccessFileNames] = useState([]);
  const [DataNoFound, setDataNoFound] = useState([]);
  const [CurrentPage,setCurrentPage] = useState(1)
  const [FinalFormData,setFinalFormData] = useState()
  const [FinalFormDataa,setFinalFormDataa] = useState()
  const [isLoading,setLoading] = useState(false)
  const loadStepper = () => {
    stepper.current = StepperComponent.createInsance(stepperRef.current as HTMLDivElement)
  }
  const prevStep = () => {
    if (!stepper.current) {
      return
    }

    setSubmitButton(stepper.current.currentStepIndex === stepper.current.totatStepsNumber! - 2)

    stepper.current.goPrev()

    setCurrentSchema(createAccountSchemas[stepper.current.currentStepIndex - 1])
    setCurrentPage(stepper.current.currentStepIndex - 1)
  }

  useEffect(() => {
    if (!stepperRef.current) {
      return
    }

    loadStepper()
  }, [stepperRef])
  const registerHandler = async (values: any, { setSubmitting }: any) => {

    if (!stepper.current) {
      return
    }

    if (stepper.current.currentStepIndex === 1) {
      if (values.PmId) {
        axios.get(pmsystemUrl, { params: { Pm_id: values.PmId } }).then(res => {

          setdatas(res.data.data)

        }).catch(err => {

          console.log(err)
        });
      } else {

      }
    }

    setSubmitButton(stepper.current.currentStepIndex === stepper.current.totatStepsNumber! - 1)

    setCurrentSchema(createAccountSchemas[stepper.current.currentStepIndex])
    setCurrentPage(stepper.current.currentStepIndex)
    setFinalFormData(values)
    setFinalFormDataa(values)
    if (stepper.current.currentStepIndex !== stepper.current.totatStepsNumber) {

      stepper.current.goNext()
    } else {
        setSubmitting(false)
      }
  }
 
 
  const handleSubmitForm = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

   
    var FormDataFinal :any  = FinalFormData
    console.log("FormData",FormDataFinal)

    
    if(!FormDataFinal.PmId.value){
      console.log("FormData",FormDataFinal)
      swal({
        title: 'Error',
        icon: "error",
        text: `Please choose the PM System`,
      })
      return false;
    }
    if(!FormDataFinal.PracticeId.value){
      swal({
        title: 'Error',
        icon: "error",
        text: `Please choose the Practice`,
      })
      return false;
    }
    if(!childData){
      swal({
        title: 'Error',
        icon: "error",
        text: `Please choose the Files`,
      })
      return false;
    }
    var formData = new FormData();
    formData.append("PmId", FormDataFinal.PmId);
    formData.append("PracticeId", JSON.stringify(FormDataFinal.PracticeId));
    Object.entries(childData).forEach(([key, value]) => {
      formData.append("ClaimFiles", value);
    });
    setLoading(true)
    const response = await axios.put(ClaimsDumpUpload, formData)
          
    var GetResponseData = response.data
    var MismatchTemplates = GetResponseData.Errors.MismatchTemplates
    var DataNoFound = GetResponseData.Errors.DataNoFound

    var SuccessFileNames = GetResponseData.SuccessFileNames

    if (MismatchTemplates.length > 0) {
      setErrorDataMismatchTemplate(MismatchTemplates)
    }else {
      setErrorDataMismatchTemplate([])
    }
    if (SuccessFileNames.length > 0) {
      setSuccessFileNames(SuccessFileNames)
    }else {
      setSuccessFileNames([])
    }
    if (DataNoFound.length > 0) {
      setDataNoFound(DataNoFound)
    }else {
      setDataNoFound([])
    }
    setChildData("")
    setLoading(false)
}
  return (
    <div className='card'>
      <div className='card-body'>
      <h3 className='fw-bolder m-0'>Existing Claims Upload</h3>
    <hr/>
        <div
          ref={stepperRef}
          className='stepper stepper-links d-flex flex-column pt-15'
          id='kt_create_account_stepper'
        >
          <div className='stepper-nav mb-5'>
            <div className='stepper-item current' data-kt-stepper-element='nav'>
              <h3 className='stepper-title'>PM System</h3>
            </div>

            <div className='stepper-item' data-kt-stepper-element='nav'>
              <h3 className='stepper-title'>Practice</h3>
            </div>

            <div className='stepper-item' data-kt-stepper-element='nav'>
              <h3 className='stepper-title'>Upload</h3>
            </div>
          </div>

          <Formik validationSchema={currentSchema} initialValues={initValues} onSubmit={registerHandler} >

            {(formik) => (
              <form onSubmit={formik.handleSubmit} className='mx-auto mw-600px w-100 pt-15 pb-10' noValidate id='kt_create_account_form'>
                <div className='current' data-kt-stepper-element='content'>
                  <Step1 />
                </div>

                <div data-kt-stepper-element='content'>
                  <Step2 user={PmSystem_id} />
                </div>

                <div data-kt-stepper-element='content'>
                  <Step3 passChildData={setChildData} FinalFormDatas={FinalFormData} />
                </div>
                {
                  SuccessFileNames.length > 0 ?
                    <>
                      <h4>Success Report : </h4>
                      {SuccessFileNames.map((res: any) => {
                        return (<li dangerouslySetInnerHTML={{ __html: res }}></li>)
                      })}
                      <br />
                    </>
                    : null
                }

                {
                  DataNoFound.length > 0 ?
                    <>
                      <h4>No Data Found Report : </h4>
                      {DataNoFound.map((res: any) => {
                        return (<li dangerouslySetInnerHTML={{ __html: res }}></li>)
                      })}
                      <br />
                    </>
                    : null
                }

                {
                  ErrorDataMismatchTemplate.length > 0 ?
                    <>
                      <h4>Template Mismtach Report : </h4>
                      {ErrorDataMismatchTemplate.map((res: any) => {
                        return (<li dangerouslySetInnerHTML={{ __html: res }}></li>)
                      })}
                    </>
                    : null
                }

                <div className='d-flex flex-stack pt-15'>
                  <div className='mr-2'>

                    
                    <button
                      onClick={prevStep}
                      type='button'
                      className='btn btn-lg btn-light-primary me-3'
                      data-kt-stepper-action='previous'
                    >
                      <KTSVG
                        path='/media/icons/duotune/arrows/arr063.svg'
                        className='svg-icon-4 me-1'
                      />
                      Back
                    </button>
                  </div>

                  <div>
                  
                    {CurrentPage === 2 ? <>{ childData ? <button type='button' onClick={handleSubmitForm} className='btn btn-lg btn-primary me-3'>
                      <span className='indicator-label'>
                        {!isSubmitButton && 'Continue'}
                        {isSubmitButton && 'Submit'}
                        <KTSVG
                          path='/media/icons/duotune/arrows/arr064.svg'
                          className='svg-icon-3 ms-2 me-0'
                        />
                      </span>
                    </button> : null } </> : <><button type='submit' className='btn btn-lg btn-primary me-3'>
                      <span className='indicator-label'>
                        {!isSubmitButton && 'Continue'}
                        {isSubmitButton && 'Submit'}
                        <KTSVG
                          path='/media/icons/duotune/arrows/arr064.svg'
                          className='svg-icon-3 ms-2 me-0'
                        />
                      </span>
                    </button></>}
                    
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
      {isLoading && <PageLoading />}
    </div>
    
  )
}
export { DumpClaimUpload }