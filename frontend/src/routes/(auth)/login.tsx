import {
  Link,
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useForm } from '@mantine/form'
import {
  Anchor,
  Button,
  Center,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { authApi } from '@/lib/auth.ts'

type LoginSearch = {
  redirect?: string
}

export const Route = createFileRoute('/(auth)/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      redirect: (search.redirect as string) || undefined,
    }
  },
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const router = useRouter()
  const search = Route.useSearch()

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (val) => (val.length < 1 ? 'Username is required' : null),
      password: (val) => (val.length < 1 ? 'Password is required' : null),
    },
  })

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      notifications.show({
        title: 'Welcome back!',
        message: "You've been logged in",
        color: 'green',
      })

      await router.invalidate()
      await navigate({ to: search.redirect || '/home' })
    },
    onError: (err) => {
      notifications.show({
        title: 'Login failed',
        message: err.message || 'Incorrect username or password',
        color: 'red',
      })
    },
  })

  const handleSubmit = (values: typeof form.values) => {
    loginMutation.mutate({
      username: values.username,
      password: values.password,
    })
  }

  return (
    <Center h="100vh">
      <Container size={420} w="100%">
        <Title ta="center">Welcome back!</Title>

        <Text c="dimmed" size="sm" ta="center" mt={5}>
          First time here?{' '}
          <Anchor component={Link} to="/register" size="sm">
            Sign Up
          </Anchor>
        </Text>

        <Paper withBorder shadow="sm" p={30} mt={30} radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Username"
              placeholder="Enter username"
              required
              {...form.getInputProps('username')}
            />

            <PasswordInput
              label="Password"
              placeholder="Enter password"
              required
              mt="md"
              {...form.getInputProps('password')}
            />

            <Button
              fullWidth
              mt="xl"
              type="submit"
              loading={loginMutation.isPending}
            >
              Sign In
            </Button>
          </form>
        </Paper>
      </Container>
    </Center>
  )
}
