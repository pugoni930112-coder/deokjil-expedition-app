import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import './Signup.css'

type SignupProps = {
  onRequireSignIn: () => void
}

function Signup({ onRequireSignIn }: SignupProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
      setError('회원가입 서버 설정을 준비 중이에요. 잠시 후 다시 이용해 주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error: signupError } = await getSupabaseClient().auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
        },
      })

      if (signupError) {
        setError(signupError.message)
      } else if (data.session) {
        setMessage('회원가입과 로그인이 완료됐어요. 덕질 원정을 시작해 보세요!')
      } else {
        setMessage('인증 메일을 보냈어요. 받은편지함에서 이메일 인증을 완료해 주세요.')
      }
    } catch {
      setError('회원가입을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="signup-page">
      <div className="signup-card">
        <span className="section-label">JOIN OUR FAN JOURNEY</span>
        <h1>회원가입</h1>
        <p className="signup-description">
          계정을 만들고 원정 기록과 팬 마켓 게시글을 관리해 보세요.
        </p>

        {!isSupabaseConfigured() && (
          <p className="signup-setup-note">
            현재 회원가입 서버 연결을 준비 중입니다. 연결이 완료되면 가입할 수 있어요.
          </p>
        )}

        <form className="signup-form" onSubmit={handleSubmit}>
          <label className="record-modal-label" htmlFor="signup-email">
            이메일 주소
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </label>
          <label className="record-modal-label" htmlFor="signup-password">
            비밀번호
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="8자 이상 입력해 주세요"
            />
          </label>
          <label className="record-modal-label" htmlFor="signup-confirm-password">
            비밀번호 확인
            <input
              id="signup-confirm-password"
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
            {isSubmitting ? '가입 중…' : '회원가입하고 이메일 인증하기'}
          </button>
        </form>

        <p className="signup-login-prompt">
          이미 계정이 있나요?{' '}
          <button type="button" onClick={onRequireSignIn}>로그인</button>
        </p>
        <Link className="signup-home-link" to="/">← 홈으로 돌아가기</Link>
      </div>
    </section>
  )
}

export default Signup
