import {
  Outlet,
  createFileRoute,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { useDisclosure } from '@mantine/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AppShell,
  Avatar,
  Burger,
  FileButton,
  Group,
  Menu,
  NavLink,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import {
  Home,
  LogOut,
  MoreVertical,
  PlusCircle,
  Settings,
  User,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { authApi } from '@/lib/api/auth.ts'
import { userApi } from '@/lib/api/user.ts'
import { NavButton } from '@/components/NavButton.tsx'
import { CreatePostModal } from '@/components/CreatePostModal.tsx'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    let user
    try {
      user = await context.queryClient.ensureQueryData({
        queryKey: ['session'],
        queryFn: userApi.getMe,
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
  component: AppLayout,
})

function AppLayout() {
  const { user } = Route.useRouteContext()
  const [opened, { toggle }] = useDisclosure()
  const router = useRouter()
  const queryClient = useQueryClient()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const handleFileSelect = (file: File | null) => {
    if (file) {
      setSelectedImage(URL.createObjectURL(file))
      setCreateModalOpen(true)
    }
  }

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      await router.navigate({ to: '/login' })
      // reminder for my own sanity since this took way too long to figure out
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
    <>
      <AppShell
        header={{ height: 60, collapsed: true, offset: false }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !opened, desktop: false },
        }}
        padding="md"
      >
        <AppShell.Header hiddenFrom="sm">
          <Group h="100%" px="md">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Title order={4}>Bloom</Title>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <Group mb="xl" px="sm" visibleFrom="sm">
            <Title order={3}>Bloom</Title>
          </Group>

          <div style={{ flex: 1 }}>
            <NavButton to="/" icon={<Home size={20} />} label="Home" />
            <NavButton
              to={`/${user.username}`}
              icon={<User size={20} />}
              label="Profile"
            />

            <FileButton
              onChange={handleFileSelect}
              accept="image/png,image/jpeg"
            >
              {(props) => (
                <NavLink
                  {...props}
                  label="Create Post"
                  leftSection={<PlusCircle size={20} />}
                  color="blue"
                  variant="light"
                />
              )}
            </FileButton>
          </div>

          <Menu shadow="md" width={200} position="right-end">
            <Menu.Target>
              <UnstyledButton
                w="100%"
                p="sm"
                style={(theme) => ({
                  borderRadius: theme.radius.sm,
                  color: theme.colors.dark[0],
                  '&:hover': { backgroundColor: theme.colors.dark[6] },
                })}
              >
                <Group>
                  <Avatar src={user.pfp} alt={user.name} radius="xl" />
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                      {user.name}
                    </Text>
                    <Text c="dimmed" size="xs">
                      @{user.username}
                    </Text>
                  </div>
                  <MoreVertical size={16} color="gray" />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item leftSection={<Settings size={16} />}>
                Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<LogOut size={16} />}
                onClick={() => logoutMutation.mutate()}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </AppShell.Navbar>

        <AppShell.Main>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Outlet />
          </div>
        </AppShell.Main>
      </AppShell>

      {selectedImage && (
        <CreatePostModal
          imageSrc={selectedImage}
          opened={createModalOpen}
          onClose={() => {
            setCreateModalOpen(false)
            setSelectedImage(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }}
        />
      )}
    </>
  )
}
