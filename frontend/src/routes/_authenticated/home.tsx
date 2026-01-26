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
      await router.navigate({ to: '/login' })
      // reminder for my own insanity since this took way too long to figure out
      // setQueryData ['session'] to null doesn't work
      // coz re logging in would just get null from the cache instead of refetching
      // resetQueries also doesn't work coz it would refetch right away
      // so there's this moment where the user details part is blank
      // removeQueries also gives this momentary blank flash
      // but putting it after navigate seems to work fine
      queryClient.removeQueries({ queryKey: ['session'] })
      await router.invalidate()
    },
  })

  return (
    <button onClick={() => logoutMutation.mutate()}>
      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
    </button>
  )
}
