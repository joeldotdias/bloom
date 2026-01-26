import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div>
      <h1>Bloom</h1>
      <p>Hello, Tanner!</p>
    </div>
  )
}
