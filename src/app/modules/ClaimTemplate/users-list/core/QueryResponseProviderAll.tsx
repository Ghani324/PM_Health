/* eslint-disable react-hooks/exhaustive-deps */
import {FC, useContext, useState, useEffect, useMemo} from 'react'
import {useQuery} from 'react-query'
import {
  createResponseContext,
  initialQueryResponse,
  initialQueryState,
  PaginationState,
  QUERIES,
  stringifyRequestQuery,
  WithChildren,
} from '../../../../../_metronic/helpers'
import {getUsers,getPmAll} from './_requests'
import {User} from './_models'
import {useQueryRequest} from './QueryRequestProvider'

const QueryResponseContextAll = createResponseContext<User>(initialQueryResponse)
const QueryResponseProviderAll: FC<WithChildren> = ({children}) => {
  const {state} = useQueryRequest()
  const [query, setQuery] = useState<string>(stringifyRequestQuery(state))
  const updatedQuery = useMemo(() => stringifyRequestQuery(state), [state])

  useEffect(() => {
    if (query !== updatedQuery) {
      setQuery(updatedQuery)
    }
  }, [updatedQuery])

  const {
    isFetching,
    refetch,
    data: response,
  } = useQuery(
    `${QUERIES.USERS_LIST}-${query}`,
    () => {
      return getPmAll()
    },
    {cacheTime: 0, keepPreviousData: true, refetchOnWindowFocus: false}
  )
  return (
    <QueryResponseContextAll.Provider value={{isLoading: isFetching, refetch, response, query}}>
      
      {children}
    </QueryResponseContextAll.Provider>
  )
}

const useQueryResponseAll = () => useContext(QueryResponseContextAll)

const useQueryResponseDataAll = () => {
  const {response} = useQueryResponseAll()
  if (!response) {
    return []
  }

  return response?.data || []
}

const useQueryResponsePaginationAll = () => {
  const defaultPaginationState: PaginationState = {
    links: [],
    ...initialQueryState,
  }

  const {response} = useQueryResponseAll()
  if (!response || !response.payload || !response.payload.pagination) {
    return defaultPaginationState
  }

  return response.payload.pagination
}

const useQueryResponseLoadingAll = (): boolean => {
  const {isLoading} = useQueryResponseAll()
  return isLoading
}

export {
  QueryResponseProviderAll,
  useQueryResponseAll,
  useQueryResponseDataAll,
  useQueryResponsePaginationAll,
  useQueryResponseLoadingAll,
}
