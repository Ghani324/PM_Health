import {useMemo} from 'react'
import {useTable, ColumnInstance, Row} from 'react-table'
import {CustomHeaderColumn} from '../table/columns/CustomHeaderColumn'
import {CustomRow} from '../table/columns/CustomRow'
import {useQueryResponseData, useQueryResponseLoading} from '../core/QueryResponseProvider'
import {usersColumns} from './columns/_columns'
import {User} from '../core/_models'
import {UsersListLoading} from '../components/loading/UsersListLoading'
import {UsersListPagination} from '../components/pagination/UsersListPagination'
import {KTCardBody} from '../../../../../_metronic/helpers'

const PmDropDown = () => {
  const users = useQueryResponseData()
  console.log("users",users)
  const isLoading = useQueryResponseLoading()
 

  return (
    <>  
        {
            users?.map((res,ind)=>{
                return (<>
                <option>{res.PmName}</option></>)
            })
            }
    </>
  )
}

export {PmDropDown}
