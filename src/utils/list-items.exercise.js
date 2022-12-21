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

const onSettled = () => queryCache.invalidateQueries('list-items')

function useUpdateListItem({token}) {
  const [update] = useMutation(
    item => client(`list-items/${item.id}`, {data: item, method: 'PUT', token}),
    {onSettled},
  )
  return update
}

function useRemoveListItem({token}) {
  const [remove] = useMutation(
    ({listItemId}) =>
      client(`list-items/${listItemId}`, {method: 'DELETE', token}),
    {onSettled},
  )
  return remove
}

function useCreateListItem({token}) {
  const [create] = useMutation(
    ({bookId}) => client(`list-items`, {data: {bookId}, token}),
    {onSettled},
  )
  return create
}

export {
  useListItems,
  useListItem,
  useCreateListItem,
  useRemoveListItem,
  useUpdateListItem,
}
