import { FC } from 'react'
import { ErrorMessage, useField } from 'formik'
import Select from 'react-select';
import axios  from 'axios';
const API_URL = process.env.REACT_APP_THEME_API_URL

type Props = {
  user?: any,
}

const Step2: FC<Props> = (user) => {

  var userData = user.user
  var PracticeList = [{ label: "Select", value: "" }]
  userData.map((res: any, index: any) => {
    PracticeList.push({
      label: res.PracticeName,
      value: res._id
    })
  })
  const [field, meta, helpers] = useField("PracticeId");
  console.log("field.value.value",field.value.value)

  const DownloadFile = async (e:any)=>{
    e.preventDefault();
    await axios.get(e.target.href,{responseType: 'arraybuffer',}).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `SampleTemplate_${field.value.label}.xlsx`);
        document.body.appendChild(link);
        link.click();
    }).catch((error) => console.log(error));
    return false;
}
  return (
    <div className='w-100'>
      <div className='mb-10 fv-row'>
        <label className='form-label mb-3'>Practice List</label>

        <Select maxMenuHeight={180} name={"PracticeId"} value={field.value} onChange={(value) => helpers.setValue(value)} options={PracticeList} />

        <div className='text-danger mt-2'>
          <ErrorMessage name='PracticeId' />
        </div>
      </div>
      {field.value.value ?
        <div className='mb-10 fv-row'>
          <a rel="noreferrer"  onClick={(e) => { DownloadFile(e) }} href={`/api/practice/templateDownlaod?practice_id=` + field.value.value} className='btn btn-lg btn-primary me-3'>
            Sample Template Downlaod
          </a>
        </div> : null
      }
    </div>
  )
}
export { Step2 }