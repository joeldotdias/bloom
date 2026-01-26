import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import {
  Anchor,
  Button,
  Center,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { z } from 'zod'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { authApi } from '@/lib/auth.ts'

export const Route = createFileRoute('/(auth)/register')({
  component: Register,
})

const registerSchema = z
  .object({
    name: z.string().trim().min(1, { message: 'Name is required' }),

    username: z
      .string()
      .trim()
      .min(3, { error: 'Username must be at least 3 characters' })
      .max(50, { error: 'Username cannot exceed 50 characters' })
      .regex(/^[a-zA-Z0-9_]+$/, {
        error: 'Username can only contain letters, numbers, and underscores',
      }),

    email: z.email({ error: 'Invalid email address' }),

    password: z
      .string()
      .min(8, { error: 'Password must be at least 8 characters' }),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  })

function Register() {
  const navigate = useNavigate()

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },

    validate: zod4Resolver(registerSchema),
  })

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: async () => {
      notifications.show({
        title: 'Account created!',
        message: 'You can now enjoy your new account.',
        color: 'green',
      })
      await navigate({ to: '/' })
    },
    onError: (err) => {
      notifications.show({
        title: 'Registration failed',
        message: err.message || 'Could not create new account',
        color: 'red',
      })
    },
  })

  const handleSubmit = (values: typeof form.values) => {
    const { confirmPassword, ...registerData } = values
    registerMutation.mutate(registerData)
  }

  return (
    <Center h="100vh">
      <Container size={420} w="100%">
        <Title ta="center">Create an account</Title>

        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Already done this?{' '}
          <Anchor component={Link} to="/login" size="sm">
            Login
          </Anchor>
        </Text>

        <Paper withBorder shadow="sm" p={30} mt={30} radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Name"
                placeholder="Your full name"
                required
                {...form.getInputProps('name')}
              />

              <TextInput
                label="Username"
                placeholder="Unique username"
                description="Letters, numbers & underscores only"
                required
                {...form.getInputProps('username')}
              />

              <TextInput
                label="Email"
                placeholder="hello@example.com"
                required
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Min 8 characters"
                required
                {...form.getInputProps('password')}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Re-enter password"
                required
                {...form.getInputProps('confirmPassword')}
              />

              <Button
                fullWidth
                mt="xl"
                type="submit"
                loading={registerMutation.isPending}
              >
                Register
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Center>
  )
}
