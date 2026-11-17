import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import './Signup.css'

function PasswordReset() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isRecovery, setIsRecovery] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    if (hashParams.get('type') === 'recovery') setIsRecovery(true)

    const { data: { subscription } } = getSupabaseClient().auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSendResetLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!isSupabaseConfigured()) {
      setError('비밀번호 재설정 서버 설정을 준비 중이에요.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error: requestError } = await getSupabaseClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}password-reset`,
      })
      if (requestError) {
        setError('재설정 메일을 보내지 못했어요. 이메일 주소를 확인해 주세요.')
      } else {
        setMessage('계정이 있는 이메일이라면 비밀번호 재설정 링크를 보냈어요. 받은편지함을 확인해 주세요.')
      }
    } catch {
      setError('재설정 메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (password.length < 8) {
      setError('비밀번호는 8자 이상으로 입력해 주세요.')
      return
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 서로 일치하지 않아요.')
      return
    }
    if (!isSupabaseConfigured()) {
      setError('비밀번호 재설정 서버 설정을 준비 중이에요.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error: updateError } = await getSupabaseClient().auth.updateUser({ password })
      if (updateError) {
        setError('비밀번호를 변경하지 못했어요. 재설정 메일 링크가 만료됐을 수 있어요.')
      } else {
        setMessage('비밀번호를 변경했어요. 새 비밀번호로 로그인할 수 있습니다.')
        setPassword('')
        setConfirmPassword('')
      }
    } catch {
      setError('비밀번호를 변경하지 못했어요. 재설정 메일을 다시 요청해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="signup-page">
      <div className="signup-card">
        <span className="section-label">ACCOUNT HELP</span>
        <h1>{isRecovery ? '새 비밀번호 설정' : '아이디 / 비밀번호 찾기'}</h1>
        <p className="signup-description">
          {isRecovery
            ? '새로 사용할 비밀번호를 입력해 주세요.'
            : '아이디는 가입한 이메일 주소예요. 비밀번호를 잊었다면 가입 이메일로 재설정 링크를 보내드릴게요.'}
        </p>

        {!isSupabaseConfigured() && (
          <p className="signup-setup-note">
            현재 계정 서버 연결을 준비 중입니다. 연결이 완료되면 이용할 수 있어요.
          </p>
        )}

        {!isRecovery && (
          <p className="signup-field-note account-help-note">
            휴대폰 번호는 인증하지 않으므로, 전화번호로 이메일 아이디를 조회할 수는 없어요.
          </p>
        )}

        {isRecovery ? (
          <form className="signup-form" onSubmit={handleUpdatePassword}>
            <label className="record-modal-label" htmlFor="reset-password">
              새 비밀번호
              <input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="8자 이상 입력해 주세요"
              />
            </label>
            <label className="record-modal-label" htmlFor="reset-confirm-password">
              비밀번호 확인
              <input
                id="reset-confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="비밀번호를 한 번 더 입력해 주세요"
              />
            </label>
            {message && <p className="signup-message" role="status">{message}</p>}
            {error && <p className="signup-error" role="alert">{error}</p>}
            <button className="record-save-button signup-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? '변경 중…' : '비밀번호 변경'}
            </button>
          </form>
        ) : (
          <form className="signup-form" onSubmit={handleSendResetLink}>
            <label className="record-modal-label" htmlFor="reset-email">
              가입 이메일 주소
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </label>
            {message && <p className="signup-message" role="status">{message}</p>}
            {error && <p className="signup-error" role="alert">{error}</p>}
            <button className="record-save-button signup-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? '전송 중…' : '재설정 링크 보내기'}
            </button>
          </form>
        )}

        <p className="signup-login-prompt">
          아이디는 회원가입 때 사용한 이메일 주소예요.
        </p>
        <Link className="signup-home-link" to="/">← 로그인으로 돌아가기</Link>
      </div>
    </section>
  )
}

export default PasswordReset
