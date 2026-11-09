// @vitest-environment node
import { setupServer } from 'msw/node'

test('does not throw when "server.close()" is called multiple times', () => {
  const server = setupServer()

  server.listen()
  server.close()

  expect(() => server.close()).not.toThrow()
})
