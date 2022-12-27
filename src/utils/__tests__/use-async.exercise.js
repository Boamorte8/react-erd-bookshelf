// 🐨 We'll use renderHook rather than render here
import {renderHook, act} from '@testing-library/react'
// 🐨 Here's the thing you'll be testing:
import {useAsync} from '../hooks'

beforeEach(() => {
  jest.spyOn(console, 'error')
})

afterEach(() => {
  console.error.mockRestore()
})

// 💰 I'm going to give this to you. It's a way for you to create a promise
// which you can imperatively resolve or reject whenever you want.
function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

function getAsyncState(overrides) {
  return {
    data: null,
    isIdle: true,
    isLoading: false,
    isError: false,
    isSuccess: false,

    error: null,
    status: 'idle',
    run: expect.any(Function),
    reset: expect.any(Function),
    setData: expect.any(Function),
    setError: expect.any(Function),
    ...overrides,
  }
}

// Use it like this:
// const {promise, resolve} = deferred()
// promise.then(() => console.log('resolved'))
// do stuff/make assertions you want to before calling resolve
// resolve()
// await promise
// do stuff/make assertions you want to after the promise has resolved

// 🐨 flesh out these tests
test('calling run with a promise which resolves', async () => {
  const {promise, resolve} = deferred()

  const {result} = renderHook(useAsync)
  expect(result.current).toEqual(getAsyncState())

  let p
  act(() => {
    p = result.current.run(promise)
  })
  expect(result.current).toEqual(
    getAsyncState({
      status: 'pending',
      isIdle: false,
      isLoading: true,
    }),
  )

  const resolvedValue = Symbol('resolved value')
  await act(async () => {
    resolve(resolvedValue)
    await p
  })
  expect(result.current).toEqual(
    getAsyncState({
      status: 'resolved',
      data: resolvedValue,
      isIdle: false,
      isLoading: false,
      isSuccess: true,
    }),
  )

  act(() => {
    result.current.reset()
  })
  expect(result.current).toEqual(getAsyncState())
})

test('calling run with a promise which rejects', async () => {
  const {promise, reject} = deferred()

  const {result} = renderHook(useAsync)
  expect(result.current).toEqual(getAsyncState())

  let p
  act(() => {
    p = result.current.run(promise)
  })
  expect(result.current).toEqual(
    getAsyncState({
      status: 'pending',
      isIdle: false,
      isLoading: true,
    }),
  )

  const rejectedValue = Symbol('rejected value')
  await act(async () => {
    reject(rejectedValue)
    await p.catch(() => {
      /* ignore erorr */
    })
  })
  expect(result.current).toEqual(
    getAsyncState({
      status: 'rejected',
      error: rejectedValue,
      isIdle: false,
      isLoading: false,
      isError: true,
    }),
  )

  act(() => {
    result.current.reset()
  })
  expect(result.current).toEqual(getAsyncState())
})

// 🐨 this will be very similar to the previous test, except you'll reject the
// promise instead and assert on the error state.
// 💰 to avoid the promise actually failing your test, you can catch
//    the promise returned from `run` with `.catch(() => {})`

test('can specify an initial state', async () => {
  const mockData = Symbol('mockData')

  const {result} = renderHook(() => useAsync({data: mockData}))
  expect(result.current).toEqual(getAsyncState({data: mockData}))
})
// 💰 useAsync(customInitialState)

test('can set the data', () => {
  const mockData = Symbol('mockData')
  const newData = {value: mockData}

  const {result} = renderHook(useAsync)
  act(() => result.current.setData(newData))
  expect(result.current).toEqual(
    getAsyncState({
      status: 'resolved',
      data: newData,
      isIdle: false,
      isSuccess: true,
    }),
  )
})
// 💰 result.current.setData('whatever you want')

test('can set the error', () => {
  const mockError = Symbol('Error has ocurred test')
  const newError = {message: mockError}

  const {result} = renderHook(useAsync)
  act(() => result.current.setError(newError))
  expect(result.current).toEqual(
    getAsyncState({
      status: 'rejected',
      data: null,
      error: newError,
      isIdle: false,
      isError: true,
    }),
  )
})
// 💰 result.current.setError('whatever you want')

test('No state updates happen if the component is unmounted while pending', async () => {
  const {promise, resolve} = deferred()
  const {result, unmount} = renderHook(() => useAsync())
  let p
  act(() => {
    p = result.current.run(promise)
  })
  unmount()
  await act(async () => {
    resolve()
    await p
  })
  expect(console.error).not.toHaveBeenCalled()
})
// 💰 const {result, unmount} = renderHook(...)
// 🐨 ensure that console.error is not called (React will call console.error if updates happen when unmounted)

test('calling "run" without a promise results in an early error', async () => {
  const {result} = renderHook(useAsync)
  expect(() => result.current.run()).toThrowErrorMatchingInlineSnapshot(
    `"The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?"`,
  )
})
