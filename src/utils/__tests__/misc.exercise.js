import {formatDate} from '../misc'

test('formatDate formats the date to look nice', () => {
  const formatedDate = formatDate(new Date(2022, 11))
  const formatedDate0 = formatDate(new Date(2022, 0))
  expect(formatedDate).toEqual('Dec 22')
  expect(formatedDate0).toEqual('Jan 22')
})
