import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { notifications } from '@mantine/notifications'
import { Button, Group, Modal, Slider, Stack, Text } from '@mantine/core'
import Cropper from 'react-easy-crop'
import { getCroppedImage } from '@/lib/cropImage.ts'
import { userApi } from '@/lib/api/user.ts'

type PfpUploadModalProps = {
  imageSrc: string | null
  opened: boolean
  onClose: () => void
}

export function AvatarUploadModal({
  imageSrc,
  opened,
  onClose,
}: PfpUploadModalProps) {
  const queryClient = useQueryClient()

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const onCropComplete = useCallback((_: any, currCroppedArea: any) => {
    setCroppedAreaPixels(currCroppedArea)
  }, [])

  const pfpUploadMutation = useMutation({
    mutationFn: userApi.uploadPfp,
    onSuccess: async () => {
      notifications.show({
        title: 'Success',
        message: 'Profile picture updated',
        color: 'green',
      })
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      onClose()
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Could not update profile picture',
        color: 'red',
      })
    },
  })

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      return
    }

    try {
      const croppedImageBlob = await getCroppedImage(
        imageSrc,
        croppedAreaPixels,
      )
      if (croppedImageBlob) {
        pfpUploadMutation.mutate(croppedImageBlob)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Adjust profile picture"
      size="lg"
      centered
    >
      <Stack>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 400,
            background: '#333',
          }}
        >
          <Cropper
            image={imageSrc || ''}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="round"
            showGrid={false}
          />
        </div>

        <Group justify="space-between">
          <Text size="sm">Zoom</Text>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={setZoom}
            style={{ flex: 1, marginLeft: 10 }}
          />
        </Group>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={pfpUploadMutation.isPending}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
