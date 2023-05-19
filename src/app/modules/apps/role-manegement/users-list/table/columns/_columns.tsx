// @ts-nocheck
import {Column} from 'react-table'
import {UserInfoCell} from './UserInfoCell'
import {UserInfoCellStatus} from './UserInfoCellStatus'
import {UserInfoCellPermission} from './UserInfoCellPermission'
import {UserInfoCellAccess} from './UserInfoCellAccess'
import {UserLastLoginCell} from './UserLastLoginCell'
import {UserTwoStepsCell} from './UserTwoStepsCell'
import {UserActionsCell} from './UserActionsCell'
import {UserSelectionCell} from './UserSelectionCell'
import {UserCustomHeader} from './UserCustomHeader'
import {UserSelectionHeader} from './UserSelectionHeader'
import {User} from '../../core/_models'

const usersColumns: ReadonlyArray<Column<User>> = [
  // {
  //   Header: (props) => <UserSelectionHeader tableProps={props} />,
  //   id: 'selection',
  //   Cell: ({...props}) => <UserSelectionCell id={props.data[props.row.index].rolename} />,
  // },
  {
    Header: (props) => <UserCustomHeader tableProps={props} title='Role Name' className='min-w-125px' />,
    id: 'rolename',
    Cell: ({...props}) => <UserInfoCell user={props.data[props.row.index]} />,
  },
  // {
  //   Header: (props) => <UserCustomHeader tableProps={props} title='Status' className='min-w-125px' />,
  //   id: 'status',
  //   Cell: ({...props}) => <UserInfoCellStatus user={props.data[props.row.index]} />,
  // },
  {
    Header: (props) => <UserCustomHeader tableProps={props} title='Permissions' className='min-w-125px' />,
    id: 'Permission',
    Cell: ({...props}) => <UserInfoCellPermission user={props.data[props.row.index]} />,
  },
  // {
  //   Header: (props) => (
  //     <UserCustomHeader tableProps={props} title='Actions' className='text-end min-w-100px' />
  //   ),
  //   id: 'actions',
  //   Cell: ({...props}) => <UserActionsCell id={props.data[props.row.index].id} />,
  // },
]

export {usersColumns}
