import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/auth.ts'

export const Route = createFileRoute('/_authenticated/home')({
  component: Home,
})

function Home() {
  const { data: user } = useQuery({
    queryKey: ['session'],
    queryFn: authApi.getMe,
  })

  return (
    <div>
      <h1>Bloom</h1>
      <p>Welcome Home</p>
      <p>Hello, {JSON.stringify(user)}!</p>

      <LogoutButton />
    </div>
  )
}

function LogoutButton() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      queryClient.setQueryData(['session'], null)
      await router.invalidate()
      router.navigate({ to: '/login' })
    },
  })

  return (
    <button onClick={() => logoutMutation.mutate()}>
      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
    </button>
  )
}
