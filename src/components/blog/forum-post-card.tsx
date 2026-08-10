import { LoaderCircle, Paperclip, Trash2 } from 'lucide-react'

import type { ForumPost } from './blog-types'
import { ForumPostMediaGrid } from './forum-post-media-grid'

type ForumPostCardProps = {
  post: ForumPost
  isOwnPost?: boolean
  isDeleting?: boolean
  currentForumName?: string | null
  onDelete?: (postId: string) => Promise<void>
}

const formatDateTime = (value: string) => {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-CR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsedDate)
}

export function ForumPostCard({
  post,
  isOwnPost = false,
  isDeleting = false,
  currentForumName,
  onDelete,
}: ForumPostCardProps) {
  return (
    <article className="rounded-[1.85rem] border border-border/70 bg-card/92 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          {post.author.profilePic ? (
            <img
              src={post.author.profilePic}
              alt={`Foto de ${post.author.username}`}
              className="size-12 shrink-0 rounded-[1.2rem] object-cover"
            />
          ) : (
            <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-primary/12 text-sm font-semibold text-primary">
              {post.author.initials}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span data-i18n-skip className="font-medium text-foreground">{post.author.username}</span>
              <span data-i18n-skip>{post.author.roleLabel}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                <span data-i18n-skip>{currentForumName || 'Comunidad'}</span>
              </span>
              <span className="text-xs text-muted-foreground">{formatDateTime(post.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-xs text-muted-foreground">
          <Paperclip className="size-3.5" />
          {post.images.length} foto{post.images.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="mt-5">
        <h3 data-i18n-skip className="text-2xl font-semibold tracking-tight text-foreground">{post.title}</h3>
        <p data-i18n-skip className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{post.text}</p>
      </div>

      <ForumPostMediaGrid images={post.images} />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <p className="text-sm text-muted-foreground">
          Publicacion creada por <span data-i18n-skip className="font-medium text-foreground">{post.author.username}</span>
        </p>

        {isOwnPost && onDelete ? (
          <button
            type="button"
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-full border border-destructive/25 bg-destructive/8 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/12 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => void onDelete(post.id)}
          >
            {isDeleting ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Eliminar
          </button>
        ) : null}
      </div>
    </article>
  )
}
