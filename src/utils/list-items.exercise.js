import {useQuery, useMutation, queryCache} from 'react-query'

import {client} from 'utils/api-client'
import {setQueryDataForBook} from './books'

function useListItems({token}) {
  const {data} = useQuery({
    queryKey: ['list-items'],
    queryFn: () => client(`list-items`, {token}).then(data => data.listItems),
    config: {
      onSuccess(items) {
        for (const item of items) {
          setQueryDataForBook(item.book)
        }
      },
    },
  })

  return data ?? []
}

function useListItem(bookId, user) {
  const listItems = useListItems(user)
  return listItems?.find(item => bookId === item.bookId) ?? null
}

const defaultMutationOptions = {
  onError: (err, variables, recover) =>
    typeof recover === 'function' ? recover() : null,
  onSettled: () => queryCache.invalidateQueries('list-items'),
}

function useUpdateListItem({token}, options) {
  return useMutation(
    item => client(`list-items/${item.id}`, {data: item, method: 'PUT', token}),
    {
      onMutate(newItem) {
        const previousItems = queryCache.getQueryData('list-items')

        queryCache.setQueryData('list-items', old => {
          return old.map(item => {
            return item.id === newItem.id ? {...item, ...newItem} : item
          })
        })

        return () => queryCache.setQueryData('list-items', previousItems)
      },
      ...defaultMutationOptions,
      ...options,
    },
  )
}

function useRemoveListItem({token}, options) {
  return useMutation(
    ({listItemId}) =>
      client(`list-items/${listItemId}`, {method: 'DELETE', token}),
    {
      onMutate(removedItem) {
        const previousItems = queryCache.getQueryData('list-items')

        queryCache.setQueryData('list-items', old => {
          return old.filter(item => item.id !== removedItem.id)
        })

        return () => queryCache.setQueryData('list-items', previousItems)
      },
      ...defaultMutationOptions,
      ...options,
    },
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
