import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'
import {PracticeList} from './users-list/PracticeList'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: '',
    path: '/Pmsystem/PmSystem',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const PmSystem = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='users'
          element={
            <>
            <h4>PM Systems</h4>
              {/* <PageTitle breadcrumbs={usersBreadcrumbs}>List Of PM Systems</PageTitle> */}
              <PracticeList />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/Pmsystem/PmSystem' />} />
    </Routes>
  )
}

export default PmSystem
