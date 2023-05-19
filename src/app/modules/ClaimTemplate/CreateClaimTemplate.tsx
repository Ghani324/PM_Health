import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'
import {TemplateList} from './users-list/TemplateList'

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

const CreateClaimTemplate = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='CreateClaimTemplate'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Template list</PageTitle>
              <TemplateList />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/ClaimTemplate/CreateClaimTemplate' />} />
    </Routes>
  )
}

export default CreateClaimTemplate
