import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'
import {PracticeList} from './users-list/PracticeList'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'Practice Management',
    path: '/Practice/CreatePractice',
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

const CreatePractice = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='CreatePractice'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Practice list</PageTitle>
              <PracticeList />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/Practice/CreatePractice' />} />
    </Routes>
  )
}

export default CreatePractice
