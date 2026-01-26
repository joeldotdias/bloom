import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { authApi } from '@/lib/auth.ts'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    let user
    try {
      user = await context.queryClient.ensureQueryData({
        queryKey: ['session'],
        queryFn: authApi.getMe,
        staleTime: 5 * 60 * 1000,
      })
    } catch (err) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }

    return { user }
  },
  component: Outlet,
})
