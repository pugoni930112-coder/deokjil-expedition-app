import { useState, type FormEvent } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'

type AuthModalProps = {
  onClose: () => void
}

function AuthModal({ onClose }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')

    if (!isSupabaseConfigured()) {
      setErrorMessage('Supabase 환경변수가 설정되지 않았습니다.')
      return
    }

    setIsSending(true)
    const { error } = await getSupabaseClient().auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
      },
    })
    setIsSending(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setMessage('로그인 링크를 요청했습니다. 이메일 받은편지함을 확인해 주세요.')
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
          이메일로 로그인 링크를 보내드릴게요. 로그인하면 원정 기록을 저장할 수 있어요.
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

          {message && <p className="auth-modal-message">{message}</p>}
          {errorMessage && <p className="auth-modal-error">{errorMessage}</p>}

          <button
            type="submit"
            className="record-save-button auth-modal-submit"
            disabled={isSending}
          >
            {isSending ? '전송 중…' : '로그인 링크 보내기'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default AuthModal
