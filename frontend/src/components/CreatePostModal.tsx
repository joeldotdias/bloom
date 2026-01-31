import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { notifications } from '@mantine/notifications'
import { Button, Group, Modal, TagsInput, Textarea } from '@mantine/core'
import Cropper from 'react-easy-crop'
import { postApi } from '@/lib/api/post.ts'
import { getCroppedImage } from '@/lib/cropImage.ts'

type CreatePostModalProps = {
  imageSrc: string | null
  opened: boolean
  onClose: () => void
}

export function CreatePostModal({
  imageSrc,
  opened,
  onClose,
}: CreatePostModalProps) {
  const queryClient = useQueryClient()

  const [caption, setCaption] = useState('')
  const [tags, setTags] = useState<Array<string>>([])
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!imageSrc || !croppedAreaPixels) {
        return
      }

      const blob = await getCroppedImage(imageSrc, croppedAreaPixels)
      if (!blob) {
        throw new Error('crop failed')
      }

      const { url, key } = await postApi.getUploadUrl('post.jpg', blob.type)
      await postApi.uploadImageToS3(url, blob)

      return postApi.createPost({ caption, imageUrl: key, tags })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] })
      onClose()
      setCaption('')
      setTags([])
      notifications.show({
        title: 'Success',
        message: 'Post created successfully',
        color: 'green',
      })
    },
  })

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create Post"
      size="lg"
      centered
    >
      <div
        style={{
          position: 'relative',
          height: 250,
          background: '#000',
        }}
      >
        <Cropper
          image={imageSrc || ''}
          crop={crop}
          zoom={zoom}
          aspect={4 / 5}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
        />
      </div>

      <Textarea
        label="Caption"
        placeholder="What ya feeling?"
        value={caption}
        onChange={(e) => setCaption(e.currentTarget.value)}
      />

      <TagsInput
        label="Tags"
        placeholder="Add tags (press enter)"
        value={tags}
        onChange={setTags}
      />

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          loading={createPostMutation.isPending}
          onClick={() => createPostMutation.mutate()}
        >
          Share
        </Button>
      </Group>
    </Modal>
  )
}
