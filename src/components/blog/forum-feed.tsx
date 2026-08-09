import { useEffect, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Flame, LockKeyhole, Sparkles } from 'lucide-react'

import type { ForumComposerPayload, ForumPost, ForumRecord } from './blog-types'
import { ForumComposerCard } from './forum-composer-card'
import { ForumPostCard } from './forum-post-card'

type ForumFeedProps = {
  activeForum: ForumRecord | null
  posts: ForumPost[]
  isLoadingPosts?: boolean
  canPublish?: boolean
  isSubmittingPost?: boolean
  isDeletingPostId?: string | null
  composerErrorMessage?: string | null
  composerSuccessMessage?: string | null
  feedTitle: string
  feedDescription: string
  currentUserId?: string | null
  useActiveForumAsCardLabel?: boolean
  isPrivateForumLocked?: boolean
  onSubmitPost: (payload: ForumComposerPayload) => Promise<void>
  onDeletePost: (postId: string) => Promise<void>
}

export function ForumFeed({
  activeForum,
  posts,
  isLoadingPosts = false,
  canPublish = false,
  isSubmittingPost = false,
  isDeletingPostId = null,
  composerErrorMessage,
  composerSuccessMessage,
  feedTitle,
  feedDescription,
  currentUserId,
  useActiveForumAsCardLabel = false,
  isPrivateForumLocked = false,
  onSubmitPost,
  onDeletePost,
}: ForumFeedProps) {
  const [isComposerExpanded, setIsComposerExpanded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 5
  const totalPages = Math.max(1, Math.ceil(posts.length / postsPerPage))
  const paginatedPosts = posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [activeForum?.id, posts.length])

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-border/70 bg-card/92 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Feed del foro</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{feedTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{feedDescription}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm text-muted-foreground">
              <Flame className="size-4 text-primary" />
              Recientes
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-primary" />
              Comunidad
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm text-muted-foreground">
              Orden cronologico
              <ChevronDown className="size-4" />
            </span>
          </div>
        </div>
      </section>

      {!isPrivateForumLocked ? <ForumComposerCard
        activeForum={activeForum}
        canPublish={canPublish}
        errorMessage={composerErrorMessage}
        isExpanded={isComposerExpanded}
        successMessage={composerSuccessMessage}
        isSubmitting={isSubmittingPost}
        onExpandChange={setIsComposerExpanded}
        onSubmit={onSubmitPost}
      /> : null}

      {isPrivateForumLocked ? (
        <section className="rounded-[1.75rem] border border-border/70 bg-card/92 p-8 text-center shadow-sm">
          <div className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LockKeyhole className="size-5" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-foreground">Foro privado</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Debes ser miembro de este foro para ver sus publicaciones y participar en la conversación.
          </p>
        </section>
      ) : null}

      {!isPrivateForumLocked ? <div className="space-y-5">
        {isLoadingPosts ? (
          <div className="rounded-[1.75rem] border border-border/70 bg-card/92 p-6 text-sm text-muted-foreground shadow-sm">
            Cargando publicaciones...
          </div>
        ) : null}

        {!isLoadingPosts && posts.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-border/80 bg-card/92 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground">Todavia no hay publicaciones para mostrar</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {activeForum
                ? `Puedes abrir la primera conversacion dentro de ${activeForum.name}.`
                : 'Selecciona un foro o espera a que la comunidad publique nuevas entradas.'}
            </p>
          </div>
        ) : null}

        {!isLoadingPosts
          ? paginatedPosts.map((post) => (
              <ForumPostCard
                key={post.id}
                currentForumName={useActiveForumAsCardLabel ? activeForum?.name ?? null : null}
                isDeleting={isDeletingPostId === post.id}
                isOwnPost={currentUserId === post.author.id}
                post={post}
                onDelete={onDeletePost}
              />
            ))
          : null}
      </div> : null}

      {!isLoadingPosts && posts.length > postsPerPage ? (
        <nav className="flex items-center justify-center gap-3" aria-label="Paginación de publicaciones">
          <button
            type="button"
            aria-label="Página anterior"
            disabled={currentPage === 1}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border/70 bg-card/92 text-muted-foreground transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            <ChevronLeft className="size-4" />
          </button>

          <span className="text-sm font-medium text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>

          <button
            type="button"
            aria-label="Página siguiente"
            disabled={currentPage === totalPages}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border/70 bg-card/92 text-muted-foreground transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          >
            <ChevronRight className="size-4" />
          </button>
        </nav>
      ) : null}
    </div>
  )
}
