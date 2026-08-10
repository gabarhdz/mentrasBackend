import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { authFetch, getStoredUserId, hasStoredSession } from '@/lib/auth'
import { buildBackendUrl } from '@/lib/utils'

import { BlogPageHero } from './blog-page-hero'
import { ForumFeed } from './forum-feed'
import { ForumSidebar } from './forum-sidebar'
import type { ForumComposerPayload, ForumImage, ForumPost, ForumRecord } from './blog-types'

type ApiForumRecord = {
  id?: string
  name?: string
  description?: string
  profile_pic?: string
  is_private?: boolean
  is_member?: boolean
  is_admin?: boolean
  created_at?: string
}

type ApiPostUser = {
  id?: string | number
  username?: string
  profile_pic?: string
  is_mod?: boolean
  is_admin?: boolean
  is_mentor?: boolean
  is_pyme_owner?: boolean
}

type ApiPostRecord = {
  id?: string
  title?: string
  text?: string
  images?: string | string[]
  created_at?: string
  forum_id?: string | number | null
  user?: ApiPostUser | null
}

type ApiJoinRequest = { id?: string; forum_id?: string; user?: ApiPostUser; status?: 'pending' | 'approved' | 'rejected'; created_at?: string }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const getResponseErrorMessage = async (response: Response, fallbackMessage: string) => {
  try {
    const data = await response.json()

    if (typeof data.detail === 'string') {
      return data.detail
    }

    if (typeof data.message === 'string') {
      return data.message
    }

    if (typeof data.error === 'string') {
      return data.error
    }

    if (isRecord(data)) {
      const firstEntry = Object.entries(data)[0]

      if (firstEntry) {
        const [, value] = firstEntry

        if (Array.isArray(value) && typeof value[0] === 'string') {
          return value[0]
        }

        if (typeof value === 'string') {
          return value
        }
      }
    }

    return fallbackMessage
  } catch {
    return fallbackMessage
  }
}

const toForumArray = (value: unknown): ApiForumRecord[] =>
  Array.isArray(value) ? (value.filter(isRecord) as ApiForumRecord[]) : []

const toPostArray = (value: unknown): ApiPostRecord[] =>
  Array.isArray(value) ? (value.filter(isRecord) as ApiPostRecord[]) : []

const parseImages = (value: string | string[] | undefined): ForumImage[] => {
  const parsedList =
    Array.isArray(value)
      ? value
      : typeof value === 'string' && value.trim()
        ? (() => {
            try {
              const parsedValue = JSON.parse(value)
              return Array.isArray(parsedValue) ? parsedValue : []
            } catch {
              return []
            }
          })()
        : []

  return parsedList
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .slice(0, 4)
    .map((src, index) => ({
      id: `${src}-${index}`,
      src,
      alt: `Imagen ${index + 1} de la publicacion`,
    }))
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('No se pudo leer una de las imagenes seleccionadas.'))
    }

    reader.onerror = () => reject(new Error('No se pudo leer una de las imagenes seleccionadas.'))
    reader.readAsDataURL(file)
  })

const optimizeImageFile = async (file: File) => {
  const sourceUrl = await readFileAsDataUrl(file)

  return new Promise<string>((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      const maxDimension = 1400
      const widthRatio = maxDimension / image.width
      const heightRatio = maxDimension / image.height
      const ratio = Math.min(1, widthRatio, heightRatio)
      const targetWidth = Math.max(1, Math.round(image.width * ratio))
      const targetHeight = Math.max(1, Math.round(image.height * ratio))

      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight

      const context = canvas.getContext('2d')

      if (!context) {
        reject(new Error('No se pudo preparar una de las imagenes seleccionadas.'))
        return
      }

      context.drawImage(image, 0, 0, targetWidth, targetHeight)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }

    image.onerror = () => reject(new Error('No se pudo procesar una de las imagenes seleccionadas.'))
    image.src = sourceUrl
  })
}

const getUserRoleLabel = (user: ApiPostUser | null | undefined) => {
  if (!user) {
    return 'Miembro'
  }

  if (user.is_admin) {
    return 'Administrador'
  }

  if (user.is_mod) {
    return 'Moderador'
  }

  if (user.is_mentor) {
    return 'Mentor'
  }

  if (user.is_pyme_owner) {
    return 'Pyme'
  }

  return 'Miembro'
}

const getInitials = (value: string) =>
  value
    .split(' ')
    .map((segment) => segment.trim()[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

const normalizeForum = (forum: ApiForumRecord, index: number): ForumRecord => ({
  id: typeof forum.id === 'string' ? forum.id : `forum-${index + 1}`,
  name: typeof forum.name === 'string' && forum.name.trim() ? forum.name.trim() : `Foro ${index + 1}`,
  description:
    typeof forum.description === 'string' && forum.description.trim()
      ? forum.description.trim()
      : 'Sin descripcion disponible.',
  profilePic: typeof forum.profile_pic === 'string' ? forum.profile_pic : '',
  isPrivate: Boolean(forum.is_private),
  isMember: Boolean(forum.is_member),
  isAdmin: Boolean(forum.is_admin),
  createdAt: typeof forum.created_at === 'string' ? forum.created_at : '',
})

const normalizePost = (post: ApiPostRecord, index: number): ForumPost => {
  const username =
    typeof post.user?.username === 'string' && post.user.username.trim()
      ? post.user.username.trim()
      : `usuario_${index + 1}`

  return {
    id: typeof post.id === 'string' ? post.id : `post-${index + 1}`,
    title:
      typeof post.title === 'string' && post.title.trim()
        ? post.title.trim()
        : 'Publicacion sin titulo',
    text:
      typeof post.text === 'string' && post.text.trim()
        ? post.text.trim()
        : 'Sin contenido disponible.',
    createdAt: typeof post.created_at === 'string' ? post.created_at : '',
    forumId:
      typeof post.forum_id === 'string'
        ? post.forum_id
        : typeof post.forum_id === 'number'
          ? String(post.forum_id)
          : null,
    images: parseImages(post.images),
    author: {
      id:
        typeof post.user?.id === 'string'
          ? post.user.id
          : typeof post.user?.id === 'number'
            ? String(post.user.id)
            : '',
      username,
      profilePic: typeof post.user?.profile_pic === 'string' ? post.user.profile_pic : '',
      roleLabel: getUserRoleLabel(post.user),
      initials: getInitials(username),
    },
  }
}

const fetchForums = async () => {
  const response = await authFetch(buildBackendUrl('/api/forum/'))

  if (!response.ok) {
    throw new Error(await getResponseErrorMessage(response, 'No se pudieron cargar los foros.'))
  }

  return toForumArray(await response.json()).map(normalizeForum)
}

const fetchPosts = async () => {
  const response = await authFetch(buildBackendUrl('/api/forum/post/'))

  if (!response.ok) {
    throw new Error(await getResponseErrorMessage(response, 'No se pudieron cargar las publicaciones.'))
  }

  return toPostArray(await response.json()).map(normalizePost)
}

const createForum = async (payload: {
  name: string
  description: string
  isPrivate: boolean
  profilePicFile: File | null
}) => {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('description', payload.description)
  formData.append('is_private', payload.isPrivate ? 'true' : 'false')

  if (payload.profilePicFile) {
    formData.append('profile_pic', payload.profilePicFile)
  }

  const response = await authFetch(buildBackendUrl('/api/forum/'), {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await getResponseErrorMessage(response, 'No se pudo crear el foro.'))
  }

  const data = (await response.json()) as ApiForumRecord
  return normalizeForum(data, 0)
}

const createForumPost = async (forumId: string, payload: ForumComposerPayload) => {
  let imageUrls: string[] = []

  if (payload.imageFiles.length > 0) {
    imageUrls = await Promise.all(payload.imageFiles.slice(0, 4).map((file) => optimizeImageFile(file)))
  }

  const response = await authFetch(buildBackendUrl('/api/forum/post/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      forum_id: forumId,
      title: payload.title,
      text: payload.text,
      images: JSON.stringify(imageUrls),
    }),
  })

  if (!response.ok) {
    throw new Error(await getResponseErrorMessage(response, 'No se pudo publicar el post.'))
  }

  const data = (await response.json()) as ApiPostRecord
  return normalizePost({ ...data, forum_id: forumId }, 0)
}

const updateForum = async (forumId: string, payload: { name: string; description: string; isPrivate: boolean }) => {
  const response = await authFetch(buildBackendUrl(`/api/forum/${forumId}/`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      description: payload.description,
      is_private: payload.isPrivate,
    }),
  })

  if (!response.ok) {
    throw new Error(await getResponseErrorMessage(response, 'No se pudo editar el foro.'))
  }

  return normalizeForum((await response.json()) as ApiForumRecord, 0)
}

const removeForumPost = async (postId: string) => {
  const response = await authFetch(buildBackendUrl(`/api/forum/post/${postId}/`), {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(await getResponseErrorMessage(response, 'No se pudo eliminar la publicacion.'))
  }
}

const removeForum = async (forumId: string) => {
  const response = await authFetch(buildBackendUrl(`/api/forum/${forumId}/`), { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(await getResponseErrorMessage(response, 'No se pudo eliminar el foro.'))
  }
}

const joinForum = async (forumId: string) => {
  const response = await authFetch(buildBackendUrl(`/api/forum/${forumId}/join/`), { method: 'POST' })
  if (!response.ok) throw new Error(await getResponseErrorMessage(response, 'No se pudo solicitar acceso al foro.'))
  return response.json() as Promise<{ message?: string; status?: 'pending' | 'approved' | 'rejected' }>
}

const fetchJoinRequests = async () => {
  const response = await authFetch(buildBackendUrl('/api/forum/join-requests/'))
  if (!response.ok) throw new Error(await getResponseErrorMessage(response, 'No se pudieron cargar las solicitudes.'))
  return toForumArray(await response.json()) as unknown as ApiJoinRequest[]
}

const decideJoinRequest = async (requestId: string, status: 'approved' | 'rejected') => {
  const response = await authFetch(buildBackendUrl(`/api/forum/join-requests/${requestId}/`), {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
  })
  if (!response.ok) throw new Error(await getResponseErrorMessage(response, 'No se pudo actualizar la solicitud.'))
}

export function BlogForumPrototype() {
  const userId = getStoredUserId()
  const [searchParams, setSearchParams] = useSearchParams()
  const [forums, setForums] = useState<ForumRecord[]>([])
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [isLoadingForums, setIsLoadingForums] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [composerErrorMessage, setComposerErrorMessage] = useState<string | null>(null)
  const [composerSuccessMessage, setComposerSuccessMessage] = useState<string | null>(null)
  const [createForumErrorMessage, setCreateForumErrorMessage] = useState<string | null>(null)
  const [createForumSuccessMessage, setCreateForumSuccessMessage] = useState<string | null>(null)
  const [isSubmittingPost, setIsSubmittingPost] = useState(false)
  const [isCreatingForum, setIsCreatingForum] = useState(false)
  const [isDeletingPostId, setIsDeletingPostId] = useState<string | null>(null)
  const [managedForumIds, setManagedForumIds] = useState<string[]>([])
  const [isJoiningForum, setIsJoiningForum] = useState(false)
  const [joinMessage, setJoinMessage] = useState<string | null>(null)
  const [joinRequests, setJoinRequests] = useState<ApiJoinRequest[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingForums(true)
        setIsLoadingPosts(true)
        setPageError(null)

        const [nextForums, nextPosts] = await Promise.all([fetchForums(), fetchPosts()])

        setForums(nextForums)
        setPosts(nextPosts)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'No se pudo cargar la seccion de foros.'
        setPageError(message)
      } finally {
        setIsLoadingForums(false)
        setIsLoadingPosts(false)
      }
    }

    void loadData()
  }, [])

  useEffect(() => {
    if (!hasStoredSession()) return
    void fetchJoinRequests().then(setJoinRequests).catch(() => undefined)
  }, [])

  const selectedForumId = searchParams.get('forum')
  const activeForum =
    forums.find((forum) => forum.id === selectedForumId) ??
    (forums.length > 0 ? forums[0] : null)
  const isPrivateForumLocked = Boolean(activeForum?.isPrivate && !activeForum.isMember)
  const forumForDisplay = isPrivateForumLocked && activeForum
    ? { ...activeForum, description: 'Este foro es privado. Debes ser miembro para ver su contenido.' }
    : activeForum

  useEffect(() => {
    if (!activeForum || selectedForumId === activeForum.id) {
      return
    }

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('forum', activeForum.id)
    setSearchParams(nextSearchParams, { replace: true })
  }, [activeForum, searchParams, selectedForumId, setSearchParams])

  const knownForumIds = new Set(forums.map((forum) => forum.id))
  const supportsScopedPosts = posts.some((post) => post.forumId && knownForumIds.has(post.forumId))

  const selectedForumPostCount =
    activeForum && supportsScopedPosts
      ? posts.filter((post) => post.forumId === activeForum.id).length
      : null

  const visiblePosts =
    isPrivateForumLocked
      ? []
      : activeForum && supportsScopedPosts
      ? posts.filter((post) => post.forumId === activeForum.id)
      : posts

  const feedTitle = activeForum
    ? supportsScopedPosts
      ? `Publicaciones en ${activeForum.name}`
      : `Actividad reciente con ${activeForum.name} como contexto activo`
    : 'Actividad reciente de la comunidad'

  const feedDescription = isPrivateForumLocked
    ? 'El contenido de este foro está restringido a sus miembros.'
    : activeForum
    ? supportsScopedPosts
      ? 'Estas publicaciones corresponden al foro que tienes seleccionado en este momento.'
      : 'El formulario queda amarrado al foro activo y el listado mantiene las publicaciones recientes disponibles.'
    : 'Elige un foro desde el directorio para centrar la lectura y la publicacion.'

  const handleSelectForum = (forumId: string) => {
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('forum', forumId)
    setSearchParams(nextSearchParams)
    setComposerErrorMessage(null)
    setComposerSuccessMessage(null)
    setCreateForumErrorMessage(null)
    setCreateForumSuccessMessage(null)
  }

  const handleCreateForum = async (payload: {
    name: string
    description: string
    isPrivate: boolean
    profilePicFile: File | null
  }) => {
    if (!hasStoredSession()) {
      setCreateForumErrorMessage('Necesitas iniciar sesion para crear un foro.')
      return
    }

    if (!payload.name.trim() || !payload.description.trim()) {
      setCreateForumErrorMessage('Completa el nombre y la descripcion antes de crear el foro.')
      return
    }

    try {
      setIsCreatingForum(true)
      setCreateForumErrorMessage(null)
      setCreateForumSuccessMessage(null)
      const createdForum = await createForum(payload)
      setManagedForumIds((current) => [...new Set([...current, createdForum.id])])
      setForums((current) => [{ ...createdForum, isAdmin: true, isMember: true }, ...current])
      const nextSearchParams = new URLSearchParams(searchParams)
      nextSearchParams.set('forum', createdForum.id)
      setSearchParams(nextSearchParams)
      setCreateForumSuccessMessage(`El foro ${createdForum.name} ya esta disponible.`)
      void fetchJoinRequests().then(setJoinRequests).catch(() => undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear el foro.'
      setCreateForumErrorMessage(message)
    } finally {
      setIsCreatingForum(false)
    }
  }

  const handleEditForum = async (forumId: string, payload: { name: string; description: string; isPrivate: boolean }) => {
    try {
      const updatedForum = await updateForum(forumId, payload)
      setForums((current) => current.map((forum) => (forum.id === forumId ? { ...forum, ...updatedForum } : forum)))
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'No se pudo editar el foro.')
    }
  }

  const handleSubmitPost = async (payload: ForumComposerPayload) => {
    if (!activeForum) {
      setComposerErrorMessage('Selecciona un foro antes de publicar.')
      return
    }

    if (!hasStoredSession()) {
      setComposerErrorMessage('Necesitas iniciar sesion para publicar.')
      return
    }

    if (!payload.title.trim() || !payload.text.trim()) {
      setComposerErrorMessage('Completa el titulo y el contenido antes de publicar.')
      return
    }

    try {
      setIsSubmittingPost(true)
      setComposerErrorMessage(null)
      setComposerSuccessMessage(null)
      const createdPost = await createForumPost(activeForum.id, payload)
      setPosts((current) => [createdPost, ...current])
      setComposerSuccessMessage(`Tu publicacion ya aparece en ${activeForum.name}.`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo publicar el post en este momento.'
      setComposerErrorMessage(message)
    } finally {
      setIsSubmittingPost(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      setIsDeletingPostId(postId)
      setComposerErrorMessage(null)
      setComposerSuccessMessage(null)
      await removeForumPost(postId)
      setPosts((current) => current.filter((post) => post.id !== postId))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo eliminar la publicacion.'
      setComposerErrorMessage(message)
    } finally {
      setIsDeletingPostId(null)
    }
  }

  const handleDeleteForum = async (forumId: string) => {
    const forum = forums.find((item) => item.id === forumId)
    if (!forum || !window.confirm(`¿Eliminar la comunidad ${forum.name}? Esta acción no se puede deshacer.`)) return

    try {
      await removeForum(forumId)
      const remainingForums = forums.filter((item) => item.id !== forumId)
      setForums(remainingForums)
      setManagedForumIds((current) => current.filter((id) => id !== forumId))
      if (remainingForums[0]) {
        const nextParams = new URLSearchParams(searchParams)
        nextParams.set('forum', remainingForums[0].id)
        setSearchParams(nextParams)
      }
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'No se pudo eliminar el foro.')
    }
  }

  const handleJoinForum = async () => {
    if (!activeForum) return
    if (!hasStoredSession()) { setJoinMessage('Necesitas iniciar sesion para unirte a un foro.'); return }
    try {
      setIsJoiningForum(true); setJoinMessage(null)
      const result = await joinForum(activeForum.id)
      if (activeForum.isPrivate) {
        setJoinMessage(result.status === 'pending' ? 'Solicitud enviada. Espera la aprobación de un administrador.' : 'Tu solicitud ya está en revisión.')
      } else {
        setForums((current) => current.map((forum) => forum.id === activeForum.id ? { ...forum, isMember: true } : forum))
        setJoinMessage('Ya eres miembro de este foro.')
      }
    } catch (error) { setJoinMessage(error instanceof Error ? error.message : 'No se pudo procesar tu acceso al foro.') }
    finally { setIsJoiningForum(false) }
  }

  const handleJoinDecision = async (requestId: string, status: 'approved' | 'rejected') => {
    try { await decideJoinRequest(requestId, status); setJoinRequests((current) => current.filter((request) => request.id !== requestId)) }
    catch (error) { setPageError(error instanceof Error ? error.message : 'No se pudo actualizar la solicitud.') }
  }

  if (pageError && forums.length === 0 && posts.length === 0) {
    return (
      <section className="rounded-[2rem] border border-destructive/20 bg-card p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-destructive">Foros</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          No pudimos cargar esta seccion
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{pageError}</p>
      </section>
    )
  }

  const visualPostCount = posts.filter((post) => post.images.length > 0).length
  const forumsWithPermissions = forums.map((forum) => ({
    ...forum,
    isAdmin: forum.isAdmin || managedForumIds.includes(forum.id),
    isMember: forum.isMember || managedForumIds.includes(forum.id),
  }))

  return (
    <div className="space-y-8">
      <BlogPageHero
        activeForum={forumForDisplay}
        forumCount={forums.length}
        postCount={posts.length}
        visualPostCount={visualPostCount}
      />

      <section className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <ForumSidebar
          activeForumId={activeForum?.id ?? null}
          canCreateForum={hasStoredSession()}
          createForumErrorMessage={createForumErrorMessage}
          createForumSuccessMessage={createForumSuccessMessage}
          forums={forumsWithPermissions}
          isCreatingForum={isCreatingForum}
          selectedForumPostCount={selectedForumPostCount}
          supportsScopedPosts={supportsScopedPosts}
          onCreateForum={handleCreateForum}
          onEditForum={handleEditForum}
          onDeleteForum={handleDeleteForum}
          onSelectForum={handleSelectForum}
          selectedForum={activeForum}
          isJoiningForum={isJoiningForum}
          joinMessage={joinMessage}
          onJoinForum={handleJoinForum}
          joinRequests={joinRequests}
          onJoinDecision={handleJoinDecision}
        />

        <ForumFeed
          activeForum={activeForum}
          canPublish={hasStoredSession()}
          composerErrorMessage={composerErrorMessage}
          composerSuccessMessage={composerSuccessMessage}
          currentUserId={userId}
          feedDescription={feedDescription}
          feedTitle={feedTitle}
          isDeletingPostId={isDeletingPostId}
          isLoadingPosts={isLoadingPosts || isLoadingForums}
          isSubmittingPost={isSubmittingPost}
          posts={visiblePosts}
          isPrivateForumLocked={isPrivateForumLocked}
          useActiveForumAsCardLabel={supportsScopedPosts}
          onDeletePost={handleDeletePost}
          onSubmitPost={handleSubmitPost}
        />
      </section>
    </div>
  )
}
