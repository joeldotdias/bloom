import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useDisclosure } from '@mantine/hooks'
import {
  Avatar,
  Box,
  Button,
  Container,
  Group,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core'
import { Calendar, Camera, MapPin, Settings } from 'lucide-react'
import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { userApi } from '@/lib/api/user.ts'
import { EditProfileModal } from '@/components/EditProfileModal.tsx'
import { AvatarUploadModal } from '@/components/PfpUploadModal.tsx'

export const Route = createFileRoute('/_authenticated/profile')({
  component: Profile,
})

function Profile() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: userApi.getMe,
  })

  const [opened, { open, close }] = useDisclosure(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      const imageUrl = URL.createObjectURL(file)
      setSelectedImage(imageUrl)
      setUploadModalOpen(true)
    }
  }

  const onAvatarClick = () => {
    if (user?.isOwner) {
      fileInputRef.current?.click()
    }
  }

  if (isLoading) return <ProfileSkeleton />

  if (!user) {
    return (
      <Text c="red" ta="center" mt="xl">
        Could not loading profile
      </Text>
    )
  }

  return (
    <Container size="md" p={0} mb="xl">
      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept="image/png, image/jpeg"
        onChange={handleFileSelect}
      />

      <Box h={180} bg="blue.5" style={{ borderRadius: '0 0 16px 16px' }} />

      <div style={{ padding: '0 24px' }}>
        <Group
          justify="space-between"
          align="flex-end"
          style={{ marginTop: -50, marginBottom: 16 }}
        >
          <div style={{ position: 'relative' }}>
            <Avatar
              src={user.pfp}
              size={120}
              radius="50%"
              style={{
                border: '4px solid var(--mantine-color-body)',
                cursor: user.isOwner ? 'pointer' : 'default',
              }}
              onClick={onAvatarClick}
            />

            {/* tiny camera overlay to show owner can change pfp */}
            {user.isOwner && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 5,
                  right: 5,
                  background: 'var(--mantine-color-default)',
                  borderRadius: '50%',
                  padding: 6,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  pointerEvents: 'none',
                }}
              >
                <Camera size={14} />
              </div>
            )}
          </div>

          {user.isOwner && (
            <Button
              radius="xl"
              variant="default"
              leftSection={<Settings size={16} />}
              onClick={open}
            >
              Edit Profile
            </Button>
          )}
        </Group>

        <Stack gap={4}>
          <Text fw={800} size="xl" lh={1}>
            {user.name}
          </Text>
          <Text c="dimmed" size="sm">
            @{user.username}
          </Text>
        </Stack>

        {user.bio && (
          <Text mt="md" style={{ whiteSpace: 'pre-wrap', maxWidth: '600px' }}>
            {user.bio}
          </Text>
        )}

        <Group mt="md" gap="lg" c="dimmed">
          {user.location && (
            <Group gap={4}>
              <MapPin size={16} />
              <Text size="sm">{user.location}</Text>
            </Group>
          )}
          <Group gap={4}>
            <Calendar size={16} />
            <Text size="sm">
              Joined {new Date(user.joinedAt).getFullYear()}
            </Text>
          </Group>
        </Group>

        {/* STATS */}
        <Group mt="md" gap="md">
          <Text size="sm">
            <Text span fw={700} c="bright">
              142
            </Text>{' '}
            <Text span c="dimmed">
              Following
            </Text>
          </Text>
          <Text size="sm">
            <Text span fw={700} c="bright">
              3.2K
            </Text>{' '}
            <Text span c="dimmed">
              Followers
            </Text>
          </Text>
        </Group>
      </div>

      <AvatarUploadModal
        imageSrc={selectedImage}
        opened={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />

      <EditProfileModal opened={opened} onClose={close} user={user} />
    </Container>
  )
}

function ProfileSkeleton() {
  return (
    <Container size="md" p={0}>
      <Skeleton height={180} radius="0 0 16px 16px" mb="xl" />
      <div style={{ padding: '0 24px' }}>
        <Group justify="space-between" align="flex-end" mt={-60} mb={20}>
          <Skeleton circle height={120} style={{ border: '4px solid white' }} />
          <Skeleton height={36} width={120} radius="xl" />
        </Group>
        <Skeleton height={30} width={200} mb={10} />
        <Skeleton height={20} width={100} mb={20} />
        <Skeleton height={60} width="80%" mb={20} />
        <Group>
          <Skeleton height={20} width={100} />
          <Skeleton height={20} width={100} />
        </Group>
      </div>
    </Container>
  )
}
