import { FC, useCallback } from 'react'
import { Field, ErrorMessage } from 'formik'
import { useDropzone, } from 'react-dropzone';

function bytesForHuman(bytes: any) {
  let units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

  let i = 0

  for (i; bytes > 1024; i++) {
    bytes /= 1024;
  }

  return bytes.toFixed(1) + ' ' + units[i]
}
function onFileUploaded(file: any) {
  console.log("file", file)
  throw new Error('Function not implemented.');
}
type Props = {
  passChildData?: any,
  FinalFormDatas?: any
}


const Step3: FC<Props> = (passChildData) => {

  const onDrop = useCallback((acceptedFiles: any[]) => {

    var filestotal = acceptedFiles.map((file: any) => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }))

    passChildData.passChildData(filestotal);

  }, [onFileUploaded]);

  const {
    acceptedFiles,
    getRootProps,
    getInputProps
  } = useDropzone({

    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xlsx']
    },
  });
  const acceptedFileItems = acceptedFiles.map((file: any) => {

    return (<li key={file.path}>
      {file.path} - {bytesForHuman(file.size)}
    </li>)
  });

  return (
    <div className='w-100'>

      <h4>
        PM & Practice Sytem : <span className='text-primary'>{passChildData.FinalFormDatas ? passChildData.FinalFormDatas.PmId.label : null} & <span className='text-primary'>{passChildData.FinalFormDatas ? passChildData.FinalFormDatas.PracticeId.label : null}</span></span>
      </h4>

      <div className='fv-row mb-10'>
        <label className='form-label required'>Select Files</label>


        <div {...getRootProps({ className: 'dropzone' })}>

          <Field name="ClaimFiles" id="ClaimFiles" type="file" multiple  {...getInputProps()} />

          <p>Drag 'n' drop some files here, or click to select files</p>

        </div>
        <br />
        <aside>
          <ul>{acceptedFileItems}</ul>
        </aside>

        <div className='text-danger mt-2'>
          <ErrorMessage name='ClaimFiles' />
        </div>
      </div>
    </div>
  )
}

export { Step3 }