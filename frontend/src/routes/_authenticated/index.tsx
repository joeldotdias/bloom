import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Center, Container, Grid, Skeleton, Stack, Text } from '@mantine/core'
import { postApi } from '@/lib/api/post.ts'
import { PostCard } from '@/components/PostCard.tsx'
import { Route as AuthRoute } from '@/routes/_authenticated.tsx'

export const Route = createFileRoute('/_authenticated/')({
  component: HomeFeed,
})

function HomeFeed() {
  const { user } = AuthRoute.useRouteContext()

  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['posts', 'feed'],
    queryFn: () => postApi.getPosts(),
  })

  if (error) {
    return (
      <Center mt="xl">
        <Text c="red">Couldn't load your feed</Text>
      </Center>
    )
  }

  return (
    <Container size="lg" py="xl">
      <Grid gutter="xl">
        {/* MAIN FEED */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="xl">
            {isLoading
              ? Array(3)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} h={600} radius="md" />)
              : posts?.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isOwner={user.username === post.author.username}
                  />
                ))}
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  )
}
