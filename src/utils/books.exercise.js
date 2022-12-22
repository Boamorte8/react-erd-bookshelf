import {useQuery, queryCache} from 'react-query'

import {client} from 'utils/api-client'
import bookPlaceholderSvg from 'assets/book-placeholder.svg'

const loadingBook = {
  title: 'Loading...',
  author: 'loading...',
  coverImageUrl: bookPlaceholderSvg,
  publisher: 'Loading Publishing',
  synopsis: 'Loading...',
  loadingBook: true,
}

const loadingBooks = Array.from({length: 10}, (v, index) => ({
  id: `loading-book-${index}`,
  ...loadingBook,
}))

export const useBook = (bookId, {token}) => {
  const {data} = useQuery({
    queryKey: ['book', {bookId}],
    queryFn: () => client(`books/${bookId}`, {token}).then(data => data.book),
  })
  return data ?? loadingBook
}

const getBookSearchConfig = (query, token) => ({
  queryKey: ['bookSearch', {query}],
  queryFn: () =>
    client(`books?query=${encodeURIComponent(query)}`, {token}).then(
      data => data.books,
    ),
})

export const useBookSearch = (query, {token}) => {
  const result = useQuery(getBookSearchConfig(query, token))

  return {...result, books: result.data ?? loadingBooks}
}

export const refetchBookSearchQuery = async ({token}) => {
  queryCache.removeQueries('bookSearch')
  await queryCache.prefetchQuery(getBookSearchConfig('', token))
}
