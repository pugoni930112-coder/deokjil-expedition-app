import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import { getAuthRedirectUrl } from '../lib/authRedirect'
import './Signup.css'

type SignupProps = {
  onRequireSignIn: () => void
}

function Signup({ onRequireSignIn }: SignupProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [twitterId, setTwitterId] = useState('')
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
    const normalizedPhone = phoneNumber.trim().replace(/[\s().-]/g, '')
    const phoneDigits = normalizedPhone.replace(/^\+/, '')
    if (!/^\d{8,15}$/.test(phoneDigits)) {
      setError('휴대폰 번호를 국가번호와 함께 입력해 주세요. 예: +82 10-1234-5678')
      return
    }
    const normalizedTwitterId = twitterId.trim().replace(/^@/, '')
    if (normalizedTwitterId && !/^[A-Za-z0-9_]{1,15}$/.test(normalizedTwitterId)) {
      setError('X(트위터) 아이디는 영문, 숫자, 밑줄로 15자 이내로 입력해 주세요.')
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
          emailRedirectTo: getAuthRedirectUrl(),
          data: {
            phone_number: normalizedPhone,
            twitter_id: normalizedTwitterId || null,
          },
        },
      })

      if (signupError) {
        setError(signupError.message)
      } else if (data.session) {
        navigate('/', { replace: true })
      } else {
        setMessage('인증 메일을 보냈어요. 받은편지함에서 이메일 인증을 완료해 주세요. 입력한 휴대폰 번호와 X 아이디는 다른 이용자에게 공개되지 않아요.')
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
          <label className="record-modal-label" htmlFor="signup-phone">
            휴대폰 번호 <span className="signup-required-label">필수</span>
            <input
              id="signup-phone"
              type="tel"
              autoComplete="tel"
              required
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="+82 10-1234-5678"
            />
          </label>
          <p className="signup-field-note">휴대폰 번호로 SMS 인증은 하지 않으며, 다른 이용자에게 공개하지 않아요.</p>
          <label className="record-modal-label" htmlFor="signup-twitter">
            X(트위터) 아이디 <span className="signup-optional-label">선택</span>
            <input
              id="signup-twitter"
              type="text"
              autoComplete="off"
              maxLength={16}
              value={twitterId}
              onChange={(event) => setTwitterId(event.target.value)}
              placeholder="@username"
            />
          </label>
          <p className="signup-field-note">선택 입력이며, 다른 이용자에게 공개되지 않아요.</p>

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
