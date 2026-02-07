import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Send } from 'lucide-react'
import {
  ActionIcon,
  Avatar,
  Box,
  Drawer,
  Group,
  LoadingOverlay,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from '@mantine/core'
import { postApi } from '@/lib/api/post.ts'
import { formatTimeAgo } from '@/lib/date.ts'

// post id would be null when the drawer is closed
// idk if this is the best way to do this
type CommentDrawerProps = {
  postId: number | null
  onClose: () => void
}

export function CommentDrawer({ postId, onClose }: CommentDrawerProps) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const isOpen = postId !== null

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => postApi.getComments(postId!),
    enabled: isOpen,
  })

  const addCommentMutation = useMutation({
    mutationFn: () => postApi.addComment(postId!, content),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      setContent('')
    },
  })

  const handleSubmit = () => {
    if (content.trim().length === 0) {
      return
    }
    addCommentMutation.mutate()
  }

  return (
    <Drawer
      opened={isOpen}
      onClose={onClose}
      position="right"
      size="md"
      title={<Text fw={700}>Comments</Text>}
      padding="md"
    >
      <Stack h="calc(100vh - 80px)" justify="space-between">
        {/* COMMENTS LIST */}
        <ScrollArea h="100%">
          <Box pos="relative">
            <LoadingOverlay visible={isLoading} />

            {comments?.length === 0 && (
              <Text c="dimmed" ta="center" mt="xl">
                Ain't nothing to see here
              </Text>
            )}

            <Stack gap="lg">
              {comments?.map((comment) => (
                <Group key={comment.id} align="flex-start" wrap="nowrap">
                  <Avatar src={comment.author.pfp} radius="xl" size="sm" />

                  <Box>
                    <Group gap="xs">
                      <Text size="sm" fw={600}>
                        {comment.author.username}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatTimeAgo(comment.createdAt)}
                      </Text>
                    </Group>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {comment.content}
                    </Text>
                  </Box>
                </Group>
              ))}
            </Stack>
          </Box>
        </ScrollArea>

        {/* COMMENT INPUT */}
        <Group
          align="flex-end"
          gap="xs"
          pt="md"
          style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}
        >
          <Textarea
            placeholder="Your opinion..."
            autosize
            minRows={1}
            maxRows={4}
            value={content}
            onChange={(e) => setContent(e.currentTarget.value)}
            style={{ flex: 1 }}
          />

          <ActionIcon
            variant="filled"
            color="blue"
            size="lg"
            onClick={handleSubmit}
            loading={addCommentMutation.isPending}
            disabled={!content.trim()}
          >
            <Send size={18} />
          </ActionIcon>
        </Group>
      </Stack>
    </Drawer>
  )
}
