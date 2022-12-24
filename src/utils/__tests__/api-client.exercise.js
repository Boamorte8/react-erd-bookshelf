// 🐨 you'll need the test server
// 💰 the way that our tests are set up, you'll find this in `src/test/server/test-server.js`
import {queryCache} from 'react-query'
import * as auth from 'auth-provider'
import {server, rest} from 'test/server'
import {client} from '../api-client'

jest.mock('react-query')
jest.mock('auth-provider')

const apiURL = process.env.REACT_APP_API_URL

// 🐨 flesh these out:

test('calls fetch at the endpoint with the arguments for GET requests', async () => {
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.json(mockResult))
    }),
  )

  const result = await client(endpoint)

  expect(result).toEqual(mockResult)
})

test('adds auth token when a token is provided', async () => {
  const fakeToken = 'fake-token'
  let request
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )

  const result = await client(endpoint, {token: fakeToken})

  expect(result).toEqual(mockResult)
  expect(request.headers.get('Authorization')).toEqual(`Bearer ${fakeToken}`)
})

test('allows for config overrides', async () => {
  const customConfig = {
    headers: {
      cors: 'test cors',
      customHeader: 'test header',
      'Content-Type': 'fake-type',
    },
  }
  let request
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )

  const result = await client(endpoint, customConfig)

  expect(result).toEqual(mockResult)
  expect(request.headers.get('cors')).toEqual(customConfig.headers.cors)
  expect(request.headers.get('customHeader')).toEqual(
    customConfig.headers.customHeader,
  )
  expect(request.headers.get('Content-Type')).toBe(
    customConfig.headers['Content-Type'],
  )
})

test('when data is provided, it is stringified and the method defaults to POST', async () => {
  const fakeData = {
    user: {
      name: 'Test',
      lastname: 'User',
      nickname: 'testuser',
    },
  }
  let request
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}

  server.use(
    rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )

  const result = await client(endpoint, {data: fakeData})

  expect(result).toEqual(mockResult)
  expect(request.body).toEqual(fakeData)
  expect(request.method).toEqual('POST')
})

test('when data is provided, it is stringified and the method defaults to POST', async () => {
  const fakeData = {
    user: {
      name: 'Test',
      lastname: 'User',
      nickname: 'testuser',
    },
  }
  let request
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}

  server.use(
    rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )

  const result = await client(endpoint, {data: fakeData})

  expect(result).toEqual(mockResult)
  expect(request.body).toEqual(fakeData)
  expect(request.method).toEqual('POST')
})

test('should return an authentication error and logout when user is not authenticated', async () => {
  const answer = {
    message: 'Testing answer.',
  }
  const endpoint = 'test-endpoint'

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(401), ctx.json(answer))
    }),
  )

  const error = await client(endpoint).catch(e => e)

  expect(error.message).toMatchInlineSnapshot(`"Please re-authenticate."`)

  expect(queryCache.clear).toHaveBeenCalledTimes(1)
  expect(auth.logout).toHaveBeenCalledTimes(1)
})

test('should answer the request with error 400 and error message', async () => {
  const answer = {
    message: 'Bad request',
  }
  const endpoint = 'test-endpoint'

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(400), ctx.json(answer))
    }),
  )

  await expect(client(endpoint)).rejects.toEqual(answer)
})
