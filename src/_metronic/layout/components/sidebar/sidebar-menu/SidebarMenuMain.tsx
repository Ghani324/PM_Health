/* eslint-disable react/jsx-no-target-blank */
import React, { useState, useEffect, FC, ChangeEvent } from 'react'
import { useIntl } from 'react-intl'
import { SidebarMenuItem } from './SidebarMenuItem'
import { useAuth } from '../../../../../app/modules/auth'
const SidebarMenuMain = () => {
  const intl = useIntl()
  const { currentUser, logout } = useAuth()
  var ListofPermission: any = currentUser?.PermissionsList
  return (
    <>
      {ListofPermission.length > 0 ?
        <>
          <SidebarMenuItem to='/dashboard' icon='/media/icons/duotune/art/art002.svg' title={`Practice Summary  - YTD`} fontIcon='bi-app-indicator' />

          <SidebarMenuItem to='/ChargesCollectionsByLocation' icon='/media/icons/duotune/art/art002.svg' title={"Charges & Collections By Location - YTD"} fontIcon='bi-app-indicator' />

          <SidebarMenuItem to='/PaymentsBreakDownbyProvider' icon='/media/icons/duotune/art/art002.svg' title={"Charges & Collections By Provider - YTD"} fontIcon='bi-app-indicator' />

          <SidebarMenuItem to='/PaymentsBreakDownbyPayer' icon='/media/icons/duotune/art/art002.svg' title={"Payments Break Down By Payer - YTD"} fontIcon='bi-app-indicator' />

          <SidebarMenuItem to='/ARDetails' icon='/media/icons/duotune/art/art002.svg' title={"AR Details"} fontIcon='bi-app-indicator' />

          <SidebarMenuItem to='/DaysInAR' icon='/media/icons/duotune/art/art002.svg' title={"Days In AR"} fontIcon='bi-app-indicator' />

          <SidebarMenuItem to='/NetCollectionRatio' icon='/media/icons/duotune/art/art002.svg' title={"Net Collection Ratio"} fontIcon='bi-app-indicator' />

          <SidebarMenuItem to='/WaterFallCollectionReport' icon='/media/icons/duotune/art/art002.svg' title={"Water Fall Collection Report"} fontIcon='bi-app-indicator' />

          <SidebarMenuItem to='/DenialRate' icon='/media/icons/duotune/art/art002.svg' title={"Denial Rate"} fontIcon='bi-app-indicator' />

<SidebarMenuItem to='/RejectionRate' icon='/media/icons/duotune/art/art002.svg' title={"Rejection Rate"} fontIcon='bi-app-indicator' />


<SidebarMenuItem to='/CleanClaimRatio' icon='/media/icons/duotune/art/art002.svg' title={"Clean Claim Rate"} fontIcon='bi-app-indicator' />

<SidebarMenuItem to='/BenchMark' icon='/media/icons/duotune/art/art002.svg' title={"Benchmarking Against Indian Standards"} fontIcon='bi-app-indicator' />
          
          
        </> : null}
    </>
  )
}
export { SidebarMenuMain }