import {lazy, FC, Suspense} from 'react'
import {Route, Routes, Navigate} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import {DashboardWrapper} from '../pages/dashboard/DashboardWrapper'
import {ChargesCollectionsByLocation} from "../pages/dashboard/ChargesCollectionsByLocation"
import {PaymentsBreakDownbyProvider} from "../pages/dashboard/PaymentsBreakDownbyProvider"
import {PaymentsBreakDownbyPayer} from "../pages/dashboard/PaymentsBreakDownbyPayer"
import {ARDetails} from "../pages/dashboard/ARDetails"
import {DaysInAR} from "../pages/dashboard/DaysInAR"
import {NetCollectionRatio} from "../pages/dashboard/NetCollectionRatio"
import {WaterFallCollectionReport} from "../pages/dashboard/WaterFallCollectionReport"
import {ViewPersonDashboard} from "../pages/dashboard/ViewPersonDashboard"
import {MenuTestPage} from '../pages/MenuTestPage'
import {getCSSVariableValue} from '../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../_metronic/helpers'
import BuilderPageWrapper from '../pages/layout-builder/BuilderPageWrapper'
import { RejectionRate } from '../pages/dashboard/RejectionRate'
import { CleanClaimRatio } from '../pages/dashboard/CleanClaimRatio'
import { DenialRate } from '../pages/dashboard/DenialRate'
import { BenchMark } from '../pages/dashboard/BenchMark'


const PrivateRoutes = () => {
  const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'))
  const AccountPage = lazy(() => import('../modules/accounts/AccountPage'))
  const TemplatePage = lazy(() => import('../modules/apps/sample-template/TemplatePage'))
  const ChatPage = lazy(() => import('../modules/apps/chat/ChatPage'))
  const UsersPage = lazy(() => import('../modules/apps/user-management/UsersPage'))
  const RolePage = lazy(() => import('../modules/apps/role-manegement/RolePage'))
  const CreateClaimTemplate = lazy(() => import('../modules/ClaimTemplate/CreateClaimTemplate'))
  
  
  return (
    <Routes>
      <Route element={<MasterLayout />}>
        <Route path='auth/*' element={<Navigate to='/dashboard' />} />
        <Route path='dashboard' element={<DashboardWrapper />} />
        <Route path='ChargesCollectionsByLocation' element={<ChargesCollectionsByLocation />} />
        <Route path='PaymentsBreakDownbyProvider' element={<PaymentsBreakDownbyProvider />} />
        <Route path='PaymentsBreakDownbyPayer' element={<PaymentsBreakDownbyPayer />} />
        <Route path='PersonDashboard' element={<ViewPersonDashboard />} />
        <Route path='DenialRate' element={<DenialRate />} />
        <Route path='RejectionRate' element={<RejectionRate />} />
        <Route path='CleanClaimRatio' element={<CleanClaimRatio />} />
        <Route path='BenchMark' element={<BenchMark />} />
        <Route path='ARDetails' element={<ARDetails />} />
        <Route path='DaysInAR' element={<DaysInAR />} />
        <Route path='WaterFallCollectionReport' element={<WaterFallCollectionReport />} />
        <Route path='NetCollectionRatio' element={<NetCollectionRatio />} />
        <Route path='CreateClaimTemplate/*' element={<CreateClaimTemplate />} />
        <Route path='builder' element={<BuilderPageWrapper />} />
        <Route path='menu-test' element={<MenuTestPage />} />
        <Route
          path='crafted/pages/profile/*'
          element={
            <SuspensedView>
              <ProfilePage />
            </SuspensedView>
          }
        />
        
        <Route
          path='crafted/account/*'
          element={
            <SuspensedView>
              <AccountPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/sample-template/*'
          element={
            <SuspensedView>
              <TemplatePage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/chat/*'
          element={
            <SuspensedView>
              <ChatPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/role-management/*'
          element={
            <SuspensedView>
              <RolePage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/user-management/*'
          element={
            <SuspensedView>
              <UsersPage />
            </SuspensedView>
          }
        />
        {/* Page Not Found */}
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes>
  )
}

const SuspensedView: FC<WithChildren> = ({children}) => {
  const baseColor = getCSSVariableValue('--kt-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export {PrivateRoutes}
