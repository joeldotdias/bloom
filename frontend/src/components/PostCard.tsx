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
  Share2,
  Trash,
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import type { Post } from '@/lib/api/post.ts'
import { postApi } from '@/lib/api/post.ts'
import { formatTimeAgo } from '@/lib/date.ts'

type PostCardProps = {
  post: Post
  isOwner?: boolean
}

export function PostCard({ post, isOwner = false }: PostCardProps) {
  const queryClient = useQueryClient()

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
      <Card.Section>
        <AspectRatio ratio={4 / 5}>
          <Image src={post.viewUrl} alt={post.caption} />
        </AspectRatio>
      </Card.Section>

      {/* INTERACTIONS */}
      <Group gap="xs" mt="sm">
        <ActionIcon variant="subtle" color="gray" size="lg">
          <Heart size={22} />
        </ActionIcon>
        <ActionIcon variant="subtle" color="gray" size="lg">
          <MessageCircle size={22} />
        </ActionIcon>
        <ActionIcon variant="subtle" color="gray" size="lg">
          <Share2 size={22} />
        </ActionIcon>
      </Group>

      {/* CAPTION */}
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

      {/* TAGS */}
      <Group gap={6} mt="xs">
        {post.tags.map((tag) => (
          <Badge key={tag} size="xs" variant="dot" color="blue">
            #{tag}
          </Badge>
        ))}
      </Group>
    </Card>
  )
}
