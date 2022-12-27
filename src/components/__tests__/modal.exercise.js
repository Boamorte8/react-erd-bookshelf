// 🐨 you're gonna need this stuff:
import React from 'react'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {Modal, ModalContents, ModalOpenButton} from '../modal'

test('can be opened and closed', async () => {
  const label = 'Modal test'
  const title = 'Modal Test Title'
  const content = 'Test modal content'

  render(
    <Modal>
      <ModalOpenButton>
        <button>Open</button>
      </ModalOpenButton>
      <ModalContents aria-label={label} title={title}>
        <p>{content}</p>
      </ModalContents>
    </Modal>,
  )
  const openButton = screen.getByRole('button', {name: /open/i})
  await userEvent.click(openButton)

  const modal = screen.getByRole('dialog')
  expect(modal).toHaveAttribute('aria-label')
  const inModal = within(modal)
  expect(inModal.getByRole('heading', {name: title})).toBeInTheDocument()
  expect(inModal.getByText(content)).toBeInTheDocument()

  const closeButton = screen.getByRole('button', {name: /close/i})
  await userEvent.click(closeButton)

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(inModal.queryByRole('heading', {name: title})).not.toBeInTheDocument()
})
// 🐨 render the Modal, ModalOpenButton, and ModalContents
// 🐨 click the open button
// 🐨 verify the modal contains the modal contents, title, and label
// 🐨 click the close button
// 🐨 verify the modal is no longer rendered
// 💰 (use `query*` rather than `get*` or `find*` queries to verify it is not rendered)
// 💰 Remember all userEvent utils are async, so you need to await them.
