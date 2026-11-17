import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'

type AuthModalProps = {
  onClose: () => void
}

function AuthModal({ onClose }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')

    if (!isSupabaseConfigured()) {
      setErrorMessage('Supabase 환경변수가 설정되지 않았습니다.')
      return
    }

    setIsSending(true)
    try {
      const { error } = await getSupabaseClient().auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) {
        setErrorMessage('이메일 또는 비밀번호를 확인해 주세요.')
        return
      }
      onClose()
    } catch {
      setErrorMessage('로그인하지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSending(false)
    }
  }

  const handleMagicLink = async () => {
    setMessage('')
    setErrorMessage('')

    if (!email.trim()) {
      setErrorMessage('먼저 이메일 주소를 입력해 주세요.')
      return
    }
    if (!isSupabaseConfigured()) {
      setErrorMessage('Supabase 환경변수가 설정되지 않았습니다.')
      return
    }

    setIsSending(true)
    try {
      const { error } = await getSupabaseClient().auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
          shouldCreateUser: false,
        },
      })
      if (error) {
        setErrorMessage(error.message)
        return
      }
      setMessage('로그인 링크를 요청했습니다. 이메일 받은편지함을 확인해 주세요.')
    } catch {
      setErrorMessage('로그인 링크를 보내지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="auth-modal-header">
          <div>
            <span className="section-label">WELCOME BACK</span>
            <h2 id="auth-modal-title">이메일로 로그인</h2>
          </div>
          <button
            type="button"
            className="record-modal-close"
            onClick={onClose}
            aria-label="로그인 창 닫기"
          >
            ×
          </button>
        </div>

        <p className="auth-modal-description">
          이메일과 비밀번호로 로그인해 원정 기록과 게시글을 관리할 수 있어요.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="record-modal-label" htmlFor="auth-email">
            이메일 주소
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </label>

          <label className="record-modal-label" htmlFor="auth-password">
            비밀번호
            <input
              id="auth-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력해 주세요"
            />
          </label>

          {message && <p className="auth-modal-message">{message}</p>}
          {errorMessage && <p className="auth-modal-error">{errorMessage}</p>}

          <button
            type="submit"
            className="record-save-button auth-modal-submit"
            disabled={isSending}
          >
            {isSending ? '확인 중…' : '로그인'}
          </button>
        </form>

        <div className="auth-modal-footer">
          <button type="button" className="auth-modal-text-button" onClick={handleMagicLink} disabled={isSending}>
            이메일 로그인 링크 받기
          </button>
          <span>처음 오셨나요?</span>
          <Link
            to="/signup"
            onClick={(event) => {
              event.preventDefault()
              onClose()
              navigate('/signup')
            }}
          >
            회원가입
          </Link>
        </div>
      </section>
    </div>
  )
}

export default AuthModal
