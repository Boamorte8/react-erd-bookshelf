import {server} from 'test/server'

// this isn't used in the solution. Only in the extra credit
beforeAll(() => server.listen())
afterAll(() => server.close())
// 🐨 afterEach test, reset the server handlers to their original handlers
afterEach(() => server.resetHandlers())
