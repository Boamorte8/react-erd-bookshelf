import {useQuery, useMutation, queryCache} from 'react-query'

import {client} from 'utils/api-client'

function useListItems({token}) {
  const {data} = useQuery({
    queryKey: ['list-items'],
    queryFn: () => client(`list-items`, {token}).then(data => data.listItems),
  })

  return data ?? []
}

function useListItem(bookId, user) {
  const listItems = useListItems(user)
  return listItems?.find(item => bookId === item.bookId) ?? null
}

const defaultMutationOptions = {
  onSettled: () => queryCache.invalidateQueries('list-items'),
}

function useUpdateListItem({token}, options) {
  return useMutation(
    item => client(`list-items/${item.id}`, {data: item, method: 'PUT', token}),
    {...defaultMutationOptions, ...options},
  )
}

function useRemoveListItem({token}, options) {
  return useMutation(
    ({listItemId}) =>
      client(`list-items/${listItemId}`, {method: 'DELETE', token}),
    {...defaultMutationOptions, ...options},
  )
}

function useCreateListItem({token}, options) {
  return useMutation(
    ({bookId}) => client(`list-items`, {data: {bookId}, token}),
    {...defaultMutationOptions, ...options},
  )
}

export {
  useListItems,
  useListItem,
  useCreateListItem,
  useRemoveListItem,
  useUpdateListItem,
}
