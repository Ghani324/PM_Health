import {ListViewProvider, useListView} from './core/ListViewProvider'
import {QueryRequestProvider} from './core/QueryRequestProvider'
import {QueryResponseProvider} from './core/QueryResponseProvider'
import {UsersListHeader} from './components/header/UsersListHeader'
import {UsersTable} from './table/UsersTable'
import {UserEditModal} from './user-edit-modal/UserEditModal'
import {KTCard} from '../../../../_metronic/helpers'

const TemplateListPage = () => {
  const {itemIdForUpdate} = useListView()
  return (
    <>
      <KTCard>
        <UsersListHeader />
        <UsersTable />
      </KTCard>
      {itemIdForUpdate !== undefined && <UserEditModal />}
    </>
  )
}

const TemplateList = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ListViewProvider>
        <TemplateListPage />
      </ListViewProvider>
    </QueryResponseProvider>
  </QueryRequestProvider>
)

export {TemplateList}