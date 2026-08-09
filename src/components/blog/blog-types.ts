export type ForumImage = {
  id: string
  src: string
  alt: string
}

export type ForumRecord = {
  id: string
  name: string
  description: string
  profilePic: string
  isPrivate: boolean
  isMember: boolean
  createdAt: string
}

export type ForumAuthor = {
  id: string
  username: string
  profilePic: string
  roleLabel: string
  initials: string
}

export type ForumPost = {
  id: string
  title: string
  text: string
  createdAt: string
  forumId: string | null
  images: ForumImage[]
  author: ForumAuthor
}

export type ForumComposerPayload = {
  title: string
  text: string
  imageFiles: File[]
}
