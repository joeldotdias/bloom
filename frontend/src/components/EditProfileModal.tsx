import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@mantine/form'
import { useEffect } from 'react'
import { notifications } from '@mantine/notifications'
import { Button, Group, Modal, Stack, TextInput, Textarea } from '@mantine/core'
import type { UserProfile } from '@/lib/auth.ts'
import { authApi } from '@/lib/auth.ts'

type EditProfileModalProps = {
  opened: boolean
  onClose: () => void
  user: UserProfile
}

export function EditProfileModal({
  opened,
  onClose,
  user,
}: EditProfileModalProps) {
  const queryClient = useQueryClient()

  const form = useForm({
    initialValues: {
      name: user.name || '',
      bio: user.bio || '',
      location: user.location || '',
    },
    validate: {
      name: (val) => (val.length < 1 ? 'Name cannot be empty' : null),
      bio: (val) =>
        val.length > 160 ? 'Bio cannot exceed 160 characters' : null,
      location: (val) =>
        val.length > 100 ? 'Location cannot exceed 100 characters' : null,
    },
  })

  // resetting form values when modal reopens
  useEffect(() => {
    if (opened) {
      form.setValues({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
      })
    }
  }, [user, opened])

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: async () => {
      notifications.show({
        title: 'Success',
        message: 'Profile updated',
        color: 'green',
      })
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      onClose()
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Could not update profile',
        color: 'red',
      })
    },
  })

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Profile" centered>
      <form
        onSubmit={form.onSubmit((values) =>
          updateProfileMutation.mutate(values),
        )}
      >
        <Stack>
          <TextInput
            label="Name"
            placeholder="Your Name"
            data-autofocus
            {...form.getInputProps('name')}
          />

          <Textarea
            label="Bio"
            placeholder="Tell us about yourself"
            autosize
            minRows={3}
            maxRows={5}
            maxLength={160}
            {...form.getInputProps('bio')}
          />

          <TextInput
            label="Location"
            placeholder="Where ya from"
            {...form.getInputProps('location')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={updateProfileMutation.isPending}>
              Save
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
