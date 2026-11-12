
import '../App.css'

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-content">
          <span className="eyebrow">OUR FAN JOURNEY</span>

          <h1>
            좋아하는 마음으로
            <br />
            <span>함께 떠나는 덕질 원정!</span>
          </h1>

          <p>
            도경수와 EXO를 사랑하는 우리들의 특별한 기록.
            <br />
            함께 모으고, 나누고, 추억을 만들어 가요.
          </p>

          <a href="#records" className="hero-button">
            원정 시작하기 <span>→</span>
          </a>
        </div>

        <div className="hero-decoration">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />

          <span className="sparkle sparkle-one">✦</span>
          <span className="sparkle sparkle-two">✧</span>
          <span className="sparkle sparkle-three">✦</span>

         <img
  className="hero-character"
  src={`${import.meta.env.BASE_URL}hero-character.png`}
  alt="마이크를 들고 무대에 선 캐릭터"
/>

          <span className="hero-caption">
            OUR DEAREST MOMENTS
          </span>
        </div>
      </section>

      {/* MENU */}
      <section className="welcome" id="records">
        <span className="section-label">EXPEDITION MENU</span>
        <h2>우리의 덕질 원정대</h2>
        <p>좋아하는 마음을 기록하고 함께 나누는 공간</p>

        <div className="menu-grid">
          <a className="menu-card" href="#records">
            <span className="card-icon">▣</span>
            <span className="card-number">01</span>
            <h3>원정 기록</h3>
            <p>콘서트, 무대인사, 팝업스토어<br />우리의 소중한 순간들</p>
            <span className="card-arrow">↗</span>
          </a>

          <a className="menu-card" href="#map">
            <span className="card-icon">⌖</span>
            <span className="card-number">02</span>
            <h3>도경수 맛집 지도</h3>
            <p>함께 가고 싶은 맛집과<br />덕질 코스를 찾아봐요</p>
            <span className="card-arrow">↗</span>
          </a>

          <a className="menu-card" href="#community">
            <span className="card-icon">▱</span>
            <span className="card-number">03</span>
            <h3>정보 공유</h3>
            <p>팬들끼리 나누는 소식과<br />유용한 정보들</p>
            <span className="card-arrow">↗</span>
          </a>

          <a className="menu-card" href="#archive">
            <span className="card-icon">♡</span>
            <span className="card-number">04</span>
            <h3>팬 아카이브</h3>
            <p>사진과 추억을 모아두는<br />우리만의 보물창고</p>
            <span className="card-arrow">↗</span>
          </a>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="community-banner" id="community">
        <span>OUR LITTLE UNIVERSE</span>
        <h2>좋아하는 마음은 함께할수록 더 커지니까.</h2>
        <p>덕질 원정대에서 새로운 추억을 만들어 봐요.</p>
      </section>
    </>
  )
}

export default Home
