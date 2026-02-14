import {
  ActionIcon,
  AspectRatio,
  Avatar,
  Badge,
  Box,
  Card,
  Group,
  Image,
  Menu,
  MenuDropdown,
  Spoiler,
  Text,
} from '@mantine/core'
import { Link } from '@tanstack/react-router'
import {
  Flag,
  Heart,
  MessageCircle,
  MoreHorizontal,
  PencilLine,
  Repeat2,
  Trash,
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { useEffect, useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import type { OriginalPostMeta, Post } from '@/lib/api/post.ts'
import { postApi } from '@/lib/api/post.ts'
import { formatTimeAgo } from '@/lib/date.ts'
import { QuoteModal } from '@/components/QuoteModal.tsx'

type PostCardProps = {
  post: Post
  isOwner?: boolean
  onCommentClick?: () => void
}

function InnerPost({ original }: { original: OriginalPostMeta }) {
  return (
    <Card
      withBorder
      padding="sm"
      radius="md"
      mt="sm"
      bg="var(--mantine-color-gray-0)"
    >
      <Link
        to="/$username"
        params={{ username: original.author.username }}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <Group gap="xs" mb="xs">
          <Avatar src={original.author.pfp} size={20} radius="xl" />
          <Text fw={700} size="sm">
            {original.author.username}
          </Text>
          <Text size="xs" c="dimmed">
            • {formatTimeAgo(original.createdAt)}
          </Text>
        </Group>
      </Link>

      {/* Truncated Caption */}
      <Text size="sm" mb={original.viewUrl ? 'xs' : 0} lineClamp={3}>
        {original.caption}
      </Text>

      {/* Tinier image preview */}
      <AspectRatio ratio={16 / 9}>
        <Image src={original.viewUrl} radius="sm" alt={original.caption} />
      </AspectRatio>
    </Card>
  )
}

export function PostCard({
  post,
  isOwner = false,
  onCommentClick,
}: PostCardProps) {
  const queryClient = useQueryClient()

  const [quoteModalOpened, { open: openQuoteModal, close: closeQuoteModal }] =
    useDisclosure(false)

  const [isLiked, setIsLiked] = useState(post.isLikedByMe)
  const [likes, setLikes] = useState(post.likeCount)
  const [isReposted, setIsReposted] = useState(post.isRepostedByMe)
  const [reposts, setReposts] = useState(post.repostCount)

  useEffect(() => {
    setIsLiked(post.isLikedByMe)
    setLikes(post.likeCount)
    setIsReposted(post.isRepostedByMe)
    setReposts(post.repostCount)
  }, [post])

  const toggleLikeMutation = useMutation({
    mutationFn: () => postApi.toggleLike(post.id),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: () => {
      setIsLiked(!isLiked)
      setLikes(isLiked ? likes + 1 : likes - 1)
      notifications.show({
        title: 'Error',
        message: 'Like failed',
        color: 'red',
      })
    },
  })

  const handleLike = () => {
    if (isLiked) {
      setLikes((prev) => Math.max(0, prev - 1))
      setIsLiked(false)
    } else {
      setLikes((prev) => prev + 1)
      setIsLiked(true)
    }

    toggleLikeMutation.mutate()
  }

  const instantRepostMutation = useMutation({
    mutationFn: () => postApi.toggleRepost(post.id, null),
    onSettled: async () =>
      await queryClient.invalidateQueries({ queryKey: ['posts'] }),
    onError: () => {
      setIsReposted(!isReposted)
      setReposts(isReposted ? reposts + 1 : reposts - 1)
      notifications.show({
        title: 'Error',
        message: 'Repost failed',
        color: 'red',
      })
    },
  })

  const handleInstantRepost = () => {
    if (isReposted) {
      setReposts((prev) => Math.max(0, prev - 1))
      setIsReposted(false)
    } else {
      setReposts((prev) => prev + 1)
      setIsReposted(true)
    }

    instantRepostMutation.mutate()
  }

  const deletePostMutation = useMutation({
    mutationFn: postApi.deletePost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] })
      await queryClient.invalidateQueries({ queryKey: ['user-posts'] })
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Could not delete post',
        color: 'red',
      })
    },
  })

  return (
    <>
      <Card withBorder padding="md" radius="md" mb="lg">
        {/* AUTHOR INFO */}
        <Card.Section inheritPadding py="xs">
          <Group justify="space-between">
            <Link
              to="/$username"
              params={{ username: post.author.username }}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Group gap="sm">
                <Avatar src={post.author.pfp} radius="xl" size="sm" />
                <div>
                  <Text size="sm" fw={600}>
                    {post.author.username}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatTimeAgo(post.createdAt)}
                  </Text>
                </div>
              </Group>
            </Link>

            <Menu withinPortal position="bottom-end" shadow="md">
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <MoreHorizontal size={18} />
                </ActionIcon>
              </Menu.Target>

              <MenuDropdown>
                {isOwner ? (
                  <Menu.Item
                    leftSection={<Trash size={14} />}
                    color="red"
                    onClick={() => deletePostMutation.mutate(post.id)}
                    disabled={deletePostMutation.isPending}
                  >
                    Delete Post
                  </Menu.Item>
                ) : (
                  <Menu.Item leftSection={<Flag size={14} />}>Report</Menu.Item>
                )}
              </MenuDropdown>
            </Menu>
          </Group>
        </Card.Section>

        {/* POST IMAGE */}
        {post.originalPost ? (
          <Card.Section inheritPadding py="xs">
            <InnerPost original={post.originalPost} />
          </Card.Section>
        ) : (
          <Card.Section>
            <AspectRatio ratio={4 / 5}>
              <Image src={post.viewUrl} alt={post.caption} />
            </AspectRatio>
          </Card.Section>
        )}

        {/* INTERACTIONS */}
        <Group gap="lg" mt="sm">
          <ActionIcon
            variant="subtle"
            color={isLiked ? 'red' : 'gray'}
            size="lg"
            onClick={handleLike}
          >
            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={onCommentClick}
          >
            <MessageCircle size={22} />
          </ActionIcon>

          <Menu position="bottom" shadow="md" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color={isReposted ? 'green' : 'gray'}
                size="lg"
              >
                <Repeat2 size={24} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<Repeat2 size={16} />}
                onClick={handleInstantRepost}
              >
                {isReposted ? 'Undo Repost' : 'Repost'}
              </Menu.Item>
              <Menu.Item
                leftSection={<PencilLine size={16} />}
                onClick={openQuoteModal}
              >
                Quote Post
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* CAPTION */}
        {post.caption && (
          <Box mt="xs">
            <Spoiler
              maxHeight={45}
              showLabel="more"
              hideLabel="less"
              transitionDuration={0}
            >
              <Text size="sm">
                <Text span fw={700} mr="xs">
                  {post.author.username}
                </Text>
                {post.caption}
              </Text>
            </Spoiler>
          </Box>
        )}

        {/* TAGS */}
        <Group gap={6} mt="xs">
          {post.tags.map((tag) => (
            <Badge key={tag} size="xs" variant="dot" color="blue">
              {tag}
            </Badge>
          ))}
        </Group>
      </Card>

      <QuoteModal
        post={post}
        opened={quoteModalOpened}
        onClose={closeQuoteModal}
      />
    </>
  )
}
