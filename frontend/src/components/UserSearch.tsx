import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
import { useQuery } from '@tanstack/react-query'
import { Autocomplete, Avatar, Group, Text } from '@mantine/core'
import { Loader, Search } from 'lucide-react'
import type { ComboboxItem, OptionsFilter } from '@mantine/core'
import type { UserSummary } from '@/lib/api/user.ts'
import { userApi } from '@/lib/api/user.ts'

export function UserSearch() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: users, isLoading } = useQuery({
    queryKey: ['search-users', debouncedQuery],
    queryFn: () => userApi.search(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  })

  const searchResults = (users || []).map((user) => ({
    value: user.username,
    label: user.username,
    ...user,
  }))

  console.log(searchResults)

  const handleUserSelect = async (username: string) => {
    await navigate({ to: '/$username', params: { username } })
    setSearchQuery('')
    inputRef.current?.blur()
  }

  const renderUserOption = ({
    option,
  }: {
    option: ComboboxItem & UserSummary
  }) => (
    <Group gap="sm">
      <Avatar src={option.pfp} size={36} radius="xl" />
      <div>
        <Text size="sm" fw={500}>
          {option.username}
        </Text>
        <Text size="xs" c="dimmed">
          {option.name}
        </Text>
      </div>
    </Group>
  )

  const filter: OptionsFilter = ({ options }) => options

  return (
    <Autocomplete
      ref={inputRef}
      value={searchQuery}
      onChange={setSearchQuery}
      placeholder="Search users..."
      leftSection={isLoading ? <Loader size="xs" /> : <Search size={16} />}
      data={searchResults}
      renderOption={renderUserOption as any}
      filter={filter}
      onOptionSubmit={handleUserSelect}
      comboboxProps={{
        shadow: 'md',
        transitionProps: { transition: 'pop', duration: 200 },
      }}
    />
  )
}
