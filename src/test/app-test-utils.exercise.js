import {
  render as rtlRender,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {AppProviders} from 'context'
import * as auth from 'auth-provider'
import {buildUser} from './generate'
import * as usersDB from './data/users'

const loginAsUser = async () => {
  const user = buildUser()
  await usersDB.create(user)
  const authUser = await usersDB.authenticate(user)
  window.localStorage.setItem(auth.localStorageKey, authUser.token)
  return authUser
}

const waitForLoadingToFinish = () => {
  return waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ])
}

const render = async (ui, {route = '/list', user, ...renderOptions} = {}) => {
  user = typeof user === 'undefined' ? await loginAsUser() : user
  window.history.pushState({}, 'Test page', route)

  const returnValue = {
    ...rtlRender(ui, {wrapper: AppProviders, ...renderOptions}),
    user,
  }

  await waitForLoadingToFinish()

  return returnValue
}

export * from '@testing-library/react'
export {render, userEvent, loginAsUser, waitForLoadingToFinish}
