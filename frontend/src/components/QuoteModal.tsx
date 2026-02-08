import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import {
  Avatar,
  Box,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
} from '@mantine/core'
import type { Post } from '@/lib/api/post.ts'
import { postApi } from '@/lib/api/post.ts'

type QuoteModalProps = {
  post: Post | null
  opened: boolean
  onClose: () => void
}

export function QuoteModal({ post, opened, onClose }: QuoteModalProps) {
  const queryClient = useQueryClient()

  const form = useForm({
    initialValues: {
      caption: '',
    },
  })

  const previewTarget = post?.originalPost || post

  const repostMutation = useMutation({
    mutationFn: (values: { caption: string }) =>
      postApi.toggleRepost(post!.id, values.caption),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] })
      notifications.show({
        title: 'Success',
        message: 'Post been quoted',
        color: 'green',
      })
      form.reset()
      onClose()
    },

    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Could not quote post',
        color: 'red',
      })
    },
  })

  if (!previewTarget) {
    return null
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Quote Post"
      centered
      size="lg"
    >
      <form onSubmit={form.onSubmit((values) => repostMutation.mutate(values))}>
        <Stack>
          <Textarea
            placeholder="Thoughts..."
            autosize
            minRows={3}
            data-autofocus
            {...form.getInputProps('caption')}
          />

          {/* Original post preview */}
          <Card
            withBorder
            padding="sm"
            radius="md"
            bg="var(--mantine-color-gray-0)"
          >
            <Group gap="xs" mb="xs">
              <Avatar src={previewTarget.author.pfp} size="xs" radius="xl" />
              <Text fw={700} size="sm">
                {previewTarget.author.username}
              </Text>
            </Group>

            <Text size="sm" lineClamp={2} mb="xs" c="dimmed">
              {previewTarget.caption}
            </Text>

            <Box
              h={150}
              style={{
                backgroundImage: `url(${previewTarget.viewUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 'var(--mantine-radius-sm)',
              }}
            />
          </Card>

          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={repostMutation.isPending}>
              Post Quote
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
