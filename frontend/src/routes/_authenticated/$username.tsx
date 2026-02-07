import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useDisclosure } from '@mantine/hooks'
import {
  ActionIcon,
  AspectRatio,
  Avatar,
  Box,
  Button,
  Center,
  Container,
  CopyButton,
  FileButton,
  Group,
  Image,
  Modal,
  Overlay,
  SimpleGrid,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Tooltip,
} from '@mantine/core'
import {
  Calendar,
  Camera,
  Check,
  Grid3X3,
  Heart,
  MapPin,
  MessageCircle,
  Repeat,
  Settings,
  Share2,
} from 'lucide-react'
import { useState } from 'react'
import type { Post } from '@/lib/api/post.ts'
import { userApi } from '@/lib/api/user.ts'
import { EditProfileModal } from '@/components/EditProfileModal.tsx'
import { AvatarUploadModal } from '@/components/PfpUploadModal.tsx'
import { postApi } from '@/lib/api/post.ts'
import { PostCard } from '@/components/PostCard.tsx'

export const Route = createFileRoute('/_authenticated/$username')({
  component: UserProfile,
})

function UserProfile() {
  const { username } = Route.useParams()

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', username],
    queryFn: () => userApi.getUser(username),
    retry: false,
  })

  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ['posts', 'user', username],
    queryFn: () => postApi.getPosts(username),
  })

  const [editModalOpen, { open: openEdit, close: closeEdit }] =
    useDisclosure(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [detailsOpen, { open: openDetails, close: closeDetails }] =
    useDisclosure(false)

  const handleFileSelect = (file: File | null) => {
    if (file) {
      setSelectedImage(URL.createObjectURL(file))
      setUploadModalOpen(true)
    }
  }

  const handlePostSelect = (post: Post) => {
    setSelectedPost(post)
    openDetails()
  }

  if (isUserLoading) return <ProfileSkeleton />

  if (!user) {
    return (
      <Text c="red" ta="center" mt="xl">
        Could not load profile
      </Text>
    )
  }

  return (
    <Container size="md" p={0} mb="xl">
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
              }}
            />

            {/* tiny camera overlay to show owner can change pfp */}
            {user.isOwner && (
              <FileButton
                onChange={handleFileSelect}
                accept="iamge/png,image/jpeg"
              >
                {(props) => (
                  <ActionIcon
                    {...props}
                    variant="filled"
                    color="gray"
                    radius="xl"
                    size="lg"
                    style={{
                      position: 'absolute',
                      bottom: 5,
                      right: 5,
                      background: '2px solid var(--mantine-color-body)',
                    }}
                  >
                    <Camera size={16} />
                  </ActionIcon>
                )}
              </FileButton>
            )}
          </div>

          {/* ACTIONS */}
          <Group gap="sm">
            {user.isOwner ? (
              <Button
                radius="xl"
                variant="default"
                leftSection={<Settings size={16} />}
                onClick={openEdit}
              >
                Edit Profile
              </Button>
            ) : (
              <Button radius="xl" color="blue">
                Follow
              </Button>
            )}

            <CopyButton value={window.location.href} timeout={2000}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Share Profile'} withArrow>
                  <ActionIcon
                    variant="default"
                    radius="xl"
                    size={36}
                    onClick={copy}
                  >
                    {copied ? <Check size={16} /> : <Share2 size={16} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </Group>

        {/* USER INFO */}
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

        <Tabs defaultValue="posts" mt="xl" color="gray" variant="pills">
          <Tabs.List>
            <Tabs.Tab value="posts" leftSection={<Grid3X3 size={14} />}>
              Posts
            </Tabs.Tab>
            <Tabs.Tab value="reposts" leftSection={<Repeat size={14} />}>
              Reposts
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="posts" pt="lg">
            {isPostsLoading ? (
              <SimpleGrid cols={3} spacing="xs">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <AspectRatio key={i} ratio={1}>
                      <Skeleton h="100%" w="100%" />
                    </AspectRatio>
                  ))}
              </SimpleGrid>
            ) : (
              <SimpleGrid cols={3} spacing="xs">
                {posts?.map((post) => (
                  <GridItem
                    key={post.id}
                    post={post}
                    onClick={() => handlePostSelect(post)}
                  />
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>
        </Tabs>
      </div>

      <Modal
        opened={detailsOpen}
        onClose={closeDetails}
        size="lg"
        padding={0}
        withCloseButton={false}
        radius="md"
        centered
      >
        {selectedPost && (
          <PostCard
            post={selectedPost}
            isOwner={username === selectedPost.author.username}
          />
        )}
      </Modal>

      {user.isOwner && (
        <>
          <AvatarUploadModal
            imageSrc={selectedImage}
            opened={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
          />

          <EditProfileModal
            opened={editModalOpen}
            onClose={closeEdit}
            user={user}
          />
        </>
      )}
    </Container>
  )
}

function GridItem({ post, onClick }: { post: Post; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Box
      style={{ position: 'relative', cursor: 'pointer' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <AspectRatio ratio={1}>
        <Image src={post.viewUrl} alt={post.caption} />
      </AspectRatio>

      {isHovered && (
        <Overlay color="#000" opacity={0.4} zIndex={1}>
          <Center h="100%">
            <Group c="white" gap="xl">
              <Group gap={6}>
                <Heart size={22} fill="white" />
                <Text fw={700}>{post.likeCount}</Text>
              </Group>
              <Group gap={6}>
                <MessageCircle size={22} fill="white" />
                <Text fw={700}>{post.commentCount}</Text>
              </Group>
            </Group>
          </Center>
        </Overlay>
      )}
    </Box>
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
