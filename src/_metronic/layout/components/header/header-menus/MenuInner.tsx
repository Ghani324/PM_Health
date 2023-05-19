// import {useIntl} from 'react-intl'
// import {MenuItem} from './MenuItem'
// import {MenuInnerWithSub} from './MenuInnerWithSub'
// import {MegaMenu} from './MegaMenu'

export function MenuInner() {
  //const intl = useIntl()
  return (
    <>
      {/* <MenuItem title={intl.formatMessage({id: 'MENU.DASHBOARD'})} to='/dashboard' /> */}
      {/* <MenuItem title='Layout Builder' to='/builder' /> */}
      {/* <MenuInnerWithSub
        title='User Management'
        to='/crafted'
        menuPlacement='bottom-start'
        menuTrigger='click'
      >
        <MenuItem icon='/media/icons/duotune/general/gen051.svg' to='/apps/user-management/users'title='Add New User' />
        
        <MenuItem icon='/media/icons/duotune/general/gen051.svg' to='/apps/user-management/users'title='List Users' />

      </MenuInnerWithSub> */}
      {/* <MenuInnerWithSub title='Role Managment' to='/apps' menuPlacement='bottom-start' menuTrigger='click'>
        
          <MenuItem to='/apps/chat/private-chat' title='Create Role' hasBullet={true} />
          <MenuItem to='/apps/chat/group-chat' title='List Roles' hasBullet={true} />
      </MenuInnerWithSub> */}

      {/* <MenuInnerWithSub
        isMega={true}
        title='Mega menu'
        to='/mega-menu'
        menuPlacement='bottom-start'
        menuTrigger='click'
      >
        <MegaMenu />
      </MenuInnerWithSub> */}
    </>
  )
}
