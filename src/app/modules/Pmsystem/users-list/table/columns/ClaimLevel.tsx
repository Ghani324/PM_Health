/* eslint-disable jsx-a11y/anchor-is-valid */
import clsx from 'clsx'
import {FC} from 'react'
import {toAbsoluteUrl} from '../../../../../../_metronic/helpers'
import {User} from '../../core/_models'

type Props = {
  user: User
}

const ClaimLevel: FC<Props> = ({user}) => (
  <div className='d-flex align-items-center'>
    {/* begin:: Avatar */}
    <div className='symbol symbol-circle symbol-50px overflow-hidden me-3'>
      
    </div>
    <div className='d-flex flex-column'>
        {user.ClaimLevel === "1" ? "Claim Based"  : "Line Based"}
      {/* <span>{user.PmName}</span> */}
    </div>
  </div>
)

export {ClaimLevel}
