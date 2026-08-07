import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff } from 'lucide-react'

import { replaceAuthTokens, setStoredUserId } from '@/lib/auth'
import { getGoogleOriginError } from '@/lib/google-auth'
import { buildBackendUrl } from '@/lib/utils'

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isPymeOwner, setIsPymeOwner] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const currentOrigin = window.location.origin
  const googleOriginError = getGoogleOriginError(currentOrigin)

  const resolveAuthSuccess = (data: unknown) => {
    if (!data || typeof data !== 'object') {
      return
    }

    const authData = data as {
      access?: unknown
      refresh?: unknown
      id?: unknown
      user?: {
        id?: unknown
      }
    }

    replaceAuthTokens({
      access: typeof authData.access === 'string' ? authData.access : undefined,
      refresh: typeof authData.refresh === 'string' ? authData.refresh : undefined,
    })

    const userId =
      typeof authData.user?.id === 'string'
        ? authData.user.id
        : typeof authData.user?.id === 'number'
          ? String(authData.user.id)
          : typeof authData.id === 'string'
            ? authData.id
            : typeof authData.id === 'number'
              ? String(authData.id)
              : null

    if (userId) {
      setStoredUserId(userId)
    }
  }

  const handleGoogleLoginSuccess = async (credentialResponse: {
    credential?: string
  }) => {
    const googleCredential = credentialResponse.credential

    if (!googleCredential) {
      setFeedback({
        type: 'error',
        message: 'Google no devolvio una credencial valida.',
      })
      return
    }

    setFeedback(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(buildBackendUrl('/api/user/accounts/google/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: googleCredential,
        }),
      })

      const data = await response.json()
      const googleAuthData = data as {
        error?: unknown
        tokens?: {
          access?: unknown
          refresh?: unknown
        }
        user?: {
          id?: unknown
        }
      }

      if (!response.ok) {
        throw new Error(
          typeof googleAuthData.error === 'string'
            ? googleAuthData.error
            : 'No se pudo iniciar sesion con Google.',
        )
      }

      const accessToken =
        typeof googleAuthData.tokens?.access === 'string'
          ? googleAuthData.tokens.access
          : undefined
      const refreshToken =
        typeof googleAuthData.tokens?.refresh === 'string'
          ? googleAuthData.tokens.refresh
          : undefined

      replaceAuthTokens({
        access: accessToken,
        refresh: refreshToken,
      })

      if (accessToken) {
        localStorage.setItem('access_token', accessToken)
      }

      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
      }

      if (googleAuthData.user) {
        localStorage.setItem('user', JSON.stringify(googleAuthData.user))
      }

      if (
        typeof googleAuthData.user?.id === 'string' ||
        typeof googleAuthData.user?.id === 'number'
      ) {
        setStoredUserId(String(googleAuthData.user.id))
      }

      setFeedback({
        type: 'success',
        message: 'Sesion iniciada correctamente con Google.',
      })
      window.location.href = '/profile'
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Ocurrio un error al iniciar sesion con Google.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleForm = () => {
    setFeedback(null)
    setIsLogin(!isLogin)
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  useEffect(() => {
    if (!profilePic) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(profilePic)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [profilePic])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    const maxFileSize = 5 * 1024 * 1024

    if (file && file.size > maxFileSize) {
      alert('La imagen es demasiado grande. Elige una menor de 5MB.')
      e.target.value = ''
      setProfilePic(null)
      return
    }

    setProfilePic(file)
  }

  const clearSelectedFile = () => {
    setProfilePic(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const resetSignupFields = () => {
    setUsername('')
    setPassword('')
    setEmail('')
    setPhoneNumber('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setIsPymeOwner(false)
    clearSelectedFile()
  }

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFeedback(null)

    if (isLogin) {
      setIsSubmitting(true)

      try {
        const response = await fetch(buildBackendUrl('/api/user/login/'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        })
        const data = await response.json()

        if (!response.ok) {
          const errorMessage =
            typeof data.detail === 'string'
              ? data.detail
              : typeof data.message === 'string'
                ? data.message
                : 'No se pudo iniciar sesion.'

          throw new Error(errorMessage)
        }

        resolveAuthSuccess(data)
        setFeedback({
          type: 'success',
          message: 'Sesion iniciada correctamente.',
        })
        window.location.href = '/profile'
      } catch (error) {
        setFeedback({
          type: 'error',
          message: error instanceof Error ? error.message : 'Ocurrio un error al iniciar sesion.',
        })
      } finally {
        setIsSubmitting(false)
      }

      return
    }

    if (password !== confirmPassword) {
      setFeedback({
        type: 'error',
        message: 'Las contrasenas no coinciden.',
      })
      return
    }

    if (!profilePic) {
      setFeedback({
        type: 'error',
        message: 'Debes subir una foto de perfil para crear el usuario.',
      })
      return
    }

    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    formData.append('profile_pic', profilePic)
    formData.append('email', email)
    formData.append('phone_number', phoneNumber)
    formData.append('is_pyme_owner', isPymeOwner ? 'true' : 'false')

    setIsSubmitting(true)

    try {
      const response = await fetch(buildBackendUrl('/api/user/'), {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) {
        let errorMessage = 'No se pudo crear el usuario.'

        if (typeof data.detail === 'string') {
          errorMessage = data.detail
        } else if (typeof data.message === 'string') {
          errorMessage = data.message
        } else if (data && typeof data === 'object') {
          errorMessage = JSON.stringify(data)
        } else {
          errorMessage = `No se pudo crear el usuario. Codigo ${response.status}.`
        }

        throw new Error(errorMessage)
      }

      setFeedback({
        type: 'success',
        message: 'Usuario creado correctamente.',
      })
      resetSignupFields()
      if (typeof data.id === 'string' || typeof data.id === 'number') {
        setStoredUserId(String(data.id))
      }
      window.location.href = '/auth-code'  
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Ocurrio un error inesperado.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative z-10 mx-auto max-w-2xl min-h-[44rem] overflow-hidden rounded-lg border border-border bg-card p-8 shadow-md before:absolute before:-left-10 before:-top-10 before:-z-10 before:h-56 before:w-56 before:rounded-full before:bg-primary/50 before:blur-3xl after:absolute after:top-16 after:-right-20 after:-z-10 after:h-64 after:w-64 after:rounded-full after:bg-primary/25 after:blur-3xl">
      <h2 className="mb-6 text-2xl font-bold text-foreground">
        {isLogin ? 'Inicia sesion en Mentras' : 'Crea tu cuenta en Mentras'}
      </h2>

      <form method="post" action="#" className="flex min-h-[calc(44rem-7rem)] flex-col" onSubmit={handleSubmit}>
        <div className="space-y-6">
          {feedback && (
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                feedback.type === 'success'
                  ? 'border-primary/30 bg-primary/10 text-foreground'
                  : 'border-destructive/30 bg-destructive/10 text-foreground'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div className={`grid gap-4 ${isLogin ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="username">
                Username
              </label>
              <input
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                name="username"
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="password">
                Contrasena
              </label>
              <div className="relative mt-1">
                <input
                  className="w-full rounded-md border border-input bg-background p-2 pr-20 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  name="password"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          {!isLogin && (
            <fieldset>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-muted-foreground" htmlFor="email">
                    Email
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    name="email"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-muted-foreground" htmlFor="phone-number">
                    Telefono
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    name="phone-number"
                    id="phone-number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-muted-foreground" htmlFor="confirm-password">
                  Confirmar contrasena
                </label>
                <div className="relative mt-1">
                  <input
                    className="w-full rounded-md border border-input bg-background p-2 pr-20 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    name="confirm-password"
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    aria-label={showConfirmPassword ? 'Ocultar confirmacion de contrasena' : 'Mostrar confirmacion de contrasena'}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <label
                htmlFor="is-pyme-owner"
                className="mb-6 flex cursor-pointer items-start gap-3 rounded-lg border border-input bg-background px-4 py-3 transition-colors hover:border-primary/50"
              >
                <input
                  className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/20"
                  name="is-pyme-owner"
                  id="is-pyme-owner"
                  type="checkbox"
                  checked={isPymeOwner}
                  onChange={(e) => setIsPymeOwner(e.target.checked)}
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">Soy dueno de una pyme</span>
                  <span className="block text-sm text-muted-foreground">
                    Activaremos este perfil como propietario de pyme en tu cuenta.
                  </span>
                </span>
              </label>

              <div className="mb-6">
                <label htmlFor="profile-pic" className="block text-sm font-medium text-muted-foreground">
                  Foto de perfil
                </label>
                <div className="mt-2 rounded-xl border border-dashed border-primary/35 bg-background/80 p-4">
                  <input
                    ref={fileInputRef}
                    className="sr-only"
                    name="profile-pic"
                    id="profile-pic"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  <label
                    htmlFor="profile-pic"
                    className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-input bg-card px-4 py-5 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {profilePic ? 'Cambiar imagen' : 'Sube una foto de perfil'}
                    </span>
                    <span className="mt-2 text-sm text-muted-foreground">
                      Toca aqui para elegir una imagen desde tu dispositivo
                    </span>
                    <span className="mt-3 text-xs text-muted-foreground/90">
                      JPG, PNG o WEBP de hasta 5MB
                    </span>
                  </label>

                  {profilePic && previewUrl && (
                    <div className="mt-4 rounded-lg border border-border bg-card p-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={previewUrl}
                          alt="Vista previa de la foto de perfil"
                          className="h-24 w-24 rounded-lg object-cover ring-1 ring-border"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {profilePic.name}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {(profilePic.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            className="mt-3 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            onClick={clearSelectedFile}
                            type="button"
                          >
                            Quitar imagen
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </fieldset>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                o entra con
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="flex justify-center">
              {googleOriginError ? (
                <div className="w-full max-w-md rounded-lg border border-dashed border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-foreground">
                  <p className="font-semibold">Google no esta disponible en este origen.</p>
                  <p className="mt-1 text-muted-foreground">
                    {googleOriginError}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    Agrega este origen en Google Cloud OAuth y, si usas el guard local, en
                    <code> VITE_GOOGLE_ALLOWED_ORIGINS </code>.
                  </p>
                </div>
              ) : (
                <div className={`flex justify-center ${isSubmitting ? 'pointer-events-none opacity-60' : ''}`}>
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => {
                      setFeedback({
                        type: 'error',
                        message: 'No se pudo iniciar sesion con Google.',
                      })
                    }}
                    text="continue_with"
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    width="100%"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              className="rounded-md bg-primary px-4 py-2 font-bold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : isLogin ? 'Iniciar sesion' : 'Registrarme'}
            </button>

            <div className="w-full text-center">
              <button
                className="text-sm font-medium text-primary transition-colors hover:text-accent"
                onClick={toggleForm}
                type="button"
              >
                {isLogin ? 'No tienes cuenta? Registrate' : 'Ya tienes cuenta? Inicia sesion'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AuthForm
