import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/auth.ts'

export const Route = createFileRoute('/_authenticated/')({
  component: App,
})

function App() {
  const { data: user } = useQuery({
    queryKey: ['session'],
    queryFn: authApi.getMe,
  })

  return (
    <div>
      <h1>Bloom</h1>
      <p>Welcome Home</p>
      <p>Hello, {JSON.stringify(user)}!</p>
    </div>
  )
}
