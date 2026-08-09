import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { BadgeCheck, ImagePlus, LoaderCircle, Lock, MessageSquare, Plus, ShieldCheck, X } from 'lucide-react'

import { cn } from '@/lib/utils'

type CreateForumPayload = {
  name: string
  description: string
  isPrivate: boolean
  profilePicFile: File | null
}

type ForumSidebarProps = {
  forums: {
    id: string
    name: string
    description: string
    profilePic: string
    isPrivate: boolean
  }[]
  activeForumId: string | null
  supportsScopedPosts: boolean
  selectedForumPostCount: number | null
  canCreateForum?: boolean
  isCreatingForum?: boolean
  createForumErrorMessage?: string | null
  createForumSuccessMessage?: string | null
  onSelectForum: (forumId: string) => void
  onCreateForum: (payload: CreateForumPayload) => Promise<void>
}

const getInitials = (value: string) =>
  value
    .split(' ')
    .map((segment) => segment.trim()[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function ForumSidebar({
  forums,
  activeForumId,
  supportsScopedPosts,
  selectedForumPostCount,
  canCreateForum = false,
  isCreatingForum = false,
  createForumErrorMessage,
  createForumSuccessMessage,
  onSelectForum,
  onCreateForum,
}: ForumSidebarProps) {
  const [isCreateExpanded, setIsCreateExpanded] = useState(false)
  const [forumName, setForumName] = useState('')
  const [forumDescription, setForumDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const profilePicPreviewUrl = useMemo(
    () => (profilePicFile ? URL.createObjectURL(profilePicFile) : null),
    [profilePicFile],
  )

  useEffect(() => {
    return () => {
      if (profilePicPreviewUrl) {
        URL.revokeObjectURL(profilePicPreviewUrl)
      }
    }
  }, [profilePicPreviewUrl])

  useEffect(() => {
    if (!createForumSuccessMessage) {
      return
    }

    setForumName('')
    setForumDescription('')
    setIsPrivate(false)
    setProfilePicFile(null)
    setIsCreateExpanded(false)
  }, [createForumSuccessMessage])

  const handleProfilePicChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null
    setProfilePicFile(nextFile)
  }

  const handleCreateForum = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    await onCreateForum({
      name: forumName.trim(),
      description: forumDescription.trim(),
      isPrivate,
      profilePicFile,
    })
  }

  return (
    <aside className="space-y-5">
      <section className="rounded-[1.75rem] border border-border/70 bg-card/92 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Foros</p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
              Directorio para ubicarte rapido
            </h3>
          </div>

          <button
            type="button"
            disabled={isCreatingForum}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setIsCreateExpanded((current) => !current)}
          >
            <Plus className="size-4" />
            Crear foro
          </button>
        </div>

        {isCreateExpanded ? (
          <form className="mt-5 space-y-4 rounded-[1.35rem] border border-border/70 bg-background/75 p-4" onSubmit={(event) => void handleCreateForum(event)}>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Nombre</span>
              <input
                className="rounded-[1rem] border border-border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary/35"
                disabled={isCreatingForum}
                maxLength={30}
                placeholder="Ejemplo: Marketing local"
                value={forumName}
                onChange={(event) => setForumName(event.target.value)}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Descripcion</span>
              <textarea
                className="min-h-28 rounded-[1rem] border border-border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary/35"
                disabled={isCreatingForum}
                maxLength={250}
                placeholder="Cuenta para que sirve este foro y que tipo de publicaciones esperas."
                value={forumDescription}
                onChange={(event) => setForumDescription(event.target.value)}
              />
            </label>

            <label className="flex items-center gap-3 rounded-[1rem] border border-border/70 bg-card px-3 py-3 text-sm text-foreground">
              <input
                checked={isPrivate}
                disabled={isCreatingForum}
                type="checkbox"
                onChange={(event) => setIsPrivate(event.target.checked)}
              />
              Foro privado
            </label>

            <div className="rounded-[1rem] border border-dashed border-border/80 bg-card p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <ImagePlus className="size-4 text-primary" />
                    Imagen del foro
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Opcional. Se envia como archivo al crear el foro.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isCreatingForum}
                  className="rounded-full border border-border/70 bg-background px-3 py-2 text-sm text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Elegir
                </button>
              </div>

              <input
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                disabled={isCreatingForum}
                type="file"
                onChange={handleProfilePicChange}
              />

              {profilePicPreviewUrl ? (
                <div className="mt-3 overflow-hidden rounded-[1rem] border border-border/70 bg-background">
                  <img src={profilePicPreviewUrl} alt="Vista previa del foro" className="aspect-[16/9] w-full object-cover" />
                  <div className="flex items-center justify-between p-3">
                    <p className="truncate text-sm text-foreground">{profilePicFile?.name}</p>
                    <button
                      type="button"
                      className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      onClick={() => setProfilePicFile(null)}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {createForumErrorMessage ? (
              <div className="rounded-[1rem] border border-destructive/25 bg-destructive/8 px-3 py-2 text-sm text-destructive">
                {createForumErrorMessage}
              </div>
            ) : null}

            {!canCreateForum ? (
              <div className="rounded-[1rem] border border-border/70 bg-background px-3 py-2 text-sm text-muted-foreground">
                Puedes preparar el formulario, pero necesitas iniciar sesion para crear el foro.
              </div>
            ) : null}

            {createForumSuccessMessage ? (
              <div className="rounded-[1rem] border border-primary/25 bg-primary/8 px-3 py-2 text-sm text-primary">
                {createForumSuccessMessage}
              </div>
            ) : null}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isCreatingForum}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingForum ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Crear foro
              </button>
              <button
                type="button"
                className="rounded-full border border-border/70 bg-background px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted"
                onClick={() => setIsCreateExpanded(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-5 space-y-3">
          {forums.map((forum) => {
            const isActive = forum.id === activeForumId

            return (
              <button
                key={forum.id}
                type="button"
                className={cn(
                  'w-full rounded-[1.35rem] border p-4 text-left transition',
                  isActive
                    ? 'border-primary/30 bg-primary/8 shadow-sm'
                    : 'border-border/70 bg-background/75 hover:border-primary/20 hover:bg-primary/5',
                )}
                onClick={() => onSelectForum(forum.id)}
              >
                <div className="flex items-start gap-3">
                  {forum.profilePic ? (
                    <img
                      src={forum.profilePic}
                      alt={`Imagen de ${forum.name}`}
                      className="size-12 rounded-[1rem] object-cover"
                    />
                  ) : (
                    <div className="inline-flex size-12 items-center justify-center rounded-[1rem] bg-primary/12 text-sm font-semibold text-primary">
                      {getInitials(forum.name)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{forum.name}</p>
                      {forum.isPrivate ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground">
                          <Lock className="size-3.5" />
                          Privado
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {forum.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-border/70 bg-card/92 p-5 shadow-sm backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Estado del foro</p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
          Contexto visible antes de publicar
        </h3>

        <div className="mt-5 space-y-3">
          <article className="rounded-[1.35rem] border border-border/70 bg-background/75 p-4">
            <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <MessageSquare className="size-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">Foro seleccionado</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {forums.find((forum) => forum.id === activeForumId)?.name || 'Todavia no se selecciono un foro.'}
            </p>
          </article>

          <article className="rounded-[1.35rem] border border-border/70 bg-background/75 p-4">
            <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <BadgeCheck className="size-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">Lectura actual</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {supportsScopedPosts && selectedForumPostCount !== null
                ? `${selectedForumPostCount} publicaciones asociadas al foro activo.`
                : 'El listado mantiene actividad reciente y el formulario publica en el foro seleccionado.'}
            </p>
          </article>

          <article className="rounded-[1.35rem] border border-border/70 bg-background/75 p-4">
            <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">Reglas practicas</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Usa un titulo claro, explica el contexto y comparte hasta cuatro imagenes cuando hagan falta.
            </p>
          </article>
        </div>
      </section>

      
    </aside>
  )
}
