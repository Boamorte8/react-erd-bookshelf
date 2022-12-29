// 🐨 here are the things you're going to need for this test:
import React from 'react'
import {
  render,
  screen,
  waitForLoadingToFinish,
  userEvent,
  loginAsUser,
} from 'test/app-test-utils'
import {buildBook, buildListItem} from 'test/generate'
import {server, rest} from 'test/server'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'
import {App} from 'app'

const fakeTimerUserEvent = userEvent.setup({
  advanceTimers: () => jest.runOnlyPendingTimers(),
})

async function renderBookScreen({user, book, listItem} = {}) {
  user = typeof user === 'undefined' ? await loginAsUser() : user
  book = typeof book === 'undefined' ? await booksDB.create(buildBook()) : book
  listItem =
    typeof listItem === 'undefined'
      ? await listItemsDB.create(buildListItem({owner: user, book}))
      : listItem
  const route = `/book/${book.id}`
  const utils = await render(<App />, {route, user})

  return {...utils, user, book, listItem}
}

test('renders all the book information', async () => {
  const {book} = await renderBookScreen({listItem: null})

  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
  expect(screen.getByRole('img', {name: /book cover/i})).toHaveAttribute(
    'src',
    book.coverImageUrl,
  )
  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()

  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('textbox', {name: /notes/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
})

test('can create a list item for the book', async () => {
  const {book} = await renderBookScreen({listItem: null})

  const addButton = screen.getByRole('button', {name: /add to list/i})

  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
  expect(addButton).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('textbox', {name: /notes/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()

  await userEvent.click(addButton)
  await waitForLoadingToFinish()

  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /add to list/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.getByRole('button', {name: /remove from list/i}),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', {name: /mark as read/i}),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(screen.getByRole('textbox', {name: /notes/i})).toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
  expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
})

test('can remove a list item for the book', async () => {
  await renderBookScreen()

  const removeButton = screen.getByRole('button', {name: /remove from list/i})

  await userEvent.click(removeButton)
  await waitForLoadingToFinish()

  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()
  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
})

test('can mark a list item as read', async () => {
  await renderBookScreen()

  const readButton = screen.getByRole('button', {name: /mark as read/i})

  await userEvent.click(readButton)
  await waitForLoadingToFinish()

  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.getByRole('button', {name: /mark as unread/i}),
  ).toBeInTheDocument()
  expect(screen.getAllByRole('radio', {name: /star/i})).toHaveLength(5)
})

test('can edit a note', async () => {
  jest.useFakeTimers()
  const newNote = 'New note text for testing purposes'
  await renderBookScreen()

  const notesInput = screen.getByRole('textbox', {name: /notes/i})

  await fakeTimerUserEvent.clear(notesInput)
  await fakeTimerUserEvent.type(notesInput, newNote)

  await screen.findByLabelText(/loading/i)
  await waitForLoadingToFinish()

  expect(notesInput).toHaveValue(newNote)
})

// describe('', () => { second })
test('shows an error message when the book fails to load', async () => {
  await renderBookScreen({
    book: buildBook({id: 'test_book_id'}),
    listItem: null,
  })

  expect((await screen.findByRole('alert')).textContent).toMatchInlineSnapshot(
    `"There was an error: Book not found"`,
  )
})

// describe('', () => { second })
test('note update failures are displayed', async () => {
  const apiURL = process.env.REACT_APP_API_URL
  jest.useFakeTimers()
  const newNote = 'New note text for testing purposes'
  const testErrorMessage = '__test_error_message__'

  server.use(
    rest.put(`${apiURL}/list-items/:listItemId`, async (req, res, ctx) => {
      return res(
        ctx.status(400),
        ctx.json({status: 400, message: testErrorMessage}),
      )
    }),
  )

  await renderBookScreen()

  const notesInput = screen.getByRole('textbox', {name: /notes/i})

  await fakeTimerUserEvent.clear(notesInput)
  await fakeTimerUserEvent.type(notesInput, newNote)

  await screen.findByLabelText(/loading/i)
  await waitForLoadingToFinish()

  expect((await screen.findByRole('alert')).textContent).toMatchInlineSnapshot(
    `"There was an error: ${testErrorMessage}"`,
  )
})
