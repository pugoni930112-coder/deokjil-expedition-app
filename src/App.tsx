
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Records from './pages/Records'
import './App.css'

function SubPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <section
      style={{
        minHeight: '65vh',
        padding: '100px 8%',
        textAlign: 'center',
        background: '#090909',
      }}
    >
      <span className="section-label">OUR FAN JOURNEY</span>
      <h1 style={{ fontSize: '36px', marginTop: '25px' }}>
        {title}
      </h1>
      <p style={{ color: '#999', marginTop: '20px' }}>
        {description}
      </p>
      <Link
        to="/"
        className="hero-button"
        style={{ marginTop: '35px' }}
      >
        HOME으로 돌아가기 →
      </Link>
    </section>
  )
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="app">
        {/* HEADER */}
        <header className="header">
          <Link className="logo" to="/">
            <img
              className="logo-image"
              src={`${import.meta.env.BASE_URL}penguin-logo.png`}
              alt="덕질 원정대 펭귄 로고"
            />
            <span>덕질 원정대</span>
          </Link>

          <nav className="nav">
            <Link to="/">HOME</Link>
            <Link to="/records">원정 기록</Link>
            <Link to="/map">맛집 지도</Link>
            <Link to="/community">정보 공유</Link>
            <Link to="/archive">ARCHIVE</Link>
          </nav>

          <button className="login-button">
            로그인
          </button>
        </header>

        {/* APP SCREENS */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />

           <Route path="/records" element={<Records />} />

            <Route
              path="/map"
              element={
                <SubPage
                  title="도경수 맛집 지도"
                  description="함께 가고 싶은 맛집과 덕질 코스를 찾아봐요."
                />
              }
            />

            <Route
              path="/community"
              element={
                <SubPage
                  title="정보 공유"
                  description="팬들과 유용한 소식과 정보를 나눠요."
                />
              }
            />

            <Route
              path="/archive"
              element={
                <SubPage
                  title="팬 아카이브"
                  description="우리만의 사진과 추억을 모아두는 공간이에요."
                />
              }
            />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer className="footer">
          <span>✦ 덕질 원정대</span>
          <p>FAN-MADE COMMUNITY · NOT OFFICIALLY AFFILIATED</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
