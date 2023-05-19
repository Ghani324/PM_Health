// import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
// import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
// //import {UsersListWrapper} from './role-list/RoleList'

// const usersBreadcrumbs: Array<PageLink> = [
//   {
//     title: 'Role Management',
//     path: '/apps/role-management/role',
//     isSeparator: false,
//     isActive: false,
//   },
//   {
//     title: '',
//     path: '',
//     isSeparator: true,
//     isActive: false,
//   },
// ]

// const RolePage = () => {
//   return (
//     <Routes>
//       <Route element={<Outlet />}>
//         <Route
//           path='role'
//           element={
//             <>
//               <PageTitle breadcrumbs={usersBreadcrumbs}>Role list</PageTitle>
//               {/* <UsersListWrapper /> */}
//             </>
//           }
//         />
//       </Route>
//       <Route index element={<Navigate to='/apps/role-management/role' />} />
//     </Routes>
//   )
// }

// export default RolePage
// import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
// import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
// //import {UsersListWrapper} from './role-list/RoleList'

// const usersBreadcrumbs: Array<PageLink> = [
//   {
//     title: 'Role Management',
//     path: '/apps/role-management/role',
//     isSeparator: false,
//     isActive: false,
//   },
//   {
//     title: '',
//     path: '',
//     isSeparator: true,
//     isActive: false,
//   },
// ]

// const RolePage = () => {
//   return (
//     <Routes>
//       <Route element={<Outlet />}>
//         <Route
//           path='role'
//           element={
//             <>
//               <PageTitle breadcrumbs={usersBreadcrumbs}>Role list</PageTitle>
//               {/* <UsersListWrapper /> */}
//             </>
//           }
//         />
//       </Route>
//       <Route index element={<Navigate to='/apps/role-management/role' />} />
//     </Routes>
//   )
// }

// export default RolePage
import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {RolesList} from './users-list/RolesList'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'Role Management',
    path: '/apps/role-management/role',
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

const RolePage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='role'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Role list</PageTitle>
              <RolesList />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/role-management/role' />} />
    </Routes>
  )
}

export default RolePage
