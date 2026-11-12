
import { useState } from 'react'
import './Records.css'

type RecordItem = {
  category: string
  title: string
  subtitle: string
  date: string
  place: string
  review: string
  icon: string
  image?: string
}

const initialRecords: RecordItem[] = [
  {
    category: '콘서트',
    title: 'EXO 팬미팅',
    subtitle: 'TOGETHER AGAIN',
    date: '2026.10.25',
    place: '고척스카이돔',
    review: '오랜만에 EXO 완전체 무대! 도경수의 무대는 역시 최고였어요 ♡',
    icon: '✦',
  },
  {
    category: '무대인사',
    title: '영화 무대인사',
    subtitle: '실낙원',
    date: '2026.10.18',
    place: 'CGV 왕십리',
    review: '가까이에서 만난 도경수는 정말 멋졌어요!',
    icon: '✧',
  },
  {
    category: '팝업스토어',
    title: 'D.O. 팝업스토어',
    subtitle: 'SPECIAL POP-UP',
    date: '2026.09.28',
    place: '더현대 서울',
    review: '귀여운 굿즈들이 가득! 역시 놓칠 수 없죠 ♡',
    icon: '♡',
  },
  {
    category: '콘서트',
    title: 'EXO 콘서트',
    subtitle: 'EXIST',
    date: '2026.07.12',
    place: 'KSPO DOME',
    review: 'EXO와 함께한 행복한 시간! 다시 또 꼭!',
    icon: '✦',
  },
  {
    category: '무대인사',
    title: '영화 무대인사',
    subtitle: '특별한 만남',
    date: '2026.06.14',
    place: 'CGV 왕십리',
    review: '따뜻한 미소와 반가운 인사, 잊지 못할 하루 ♡',
    icon: '✧',
  },
  {
    category: '기타',
    title: 'EXO 콘서트 준비',
    subtitle: 'OUR PREPARATION',
    date: '2026.06.01',
    place: '집',
    review: '콘서트 준비부터 굿즈 정리까지! 설레는 마음으로 준비했어요.',
    icon: '♡',
  },
]

const categories = ['전체', '콘서트', '무대인사', '팝업스토어', '기타']

function Records() {
  const [selectedCategory, setSelectedCategory] = useState('전체')

    const [isFormOpen, setIsFormOpen] = useState(false)

     const [selectedImage, setSelectedImage] = useState<string | null>(null) 

     const [records, setRecords] = useState<RecordItem[]>(initialRecords)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('콘서트')
  const [date, setDate] = useState('')
  const [place, setPlace] = useState('')
  const [review, setReview] = useState('')  

  const filteredRecords =
    selectedCategory === '전체'
      ? records
      : records.filter((record) => record.category === selectedCategory)

        const handleSave = () => {
    if (!title.trim() || !date || !place.trim()) {
      alert('제목, 방문 날짜, 방문 장소를 입력해 주세요.')
      return
    }

    const newRecord: RecordItem = {
      category,
      title: title.trim(),
      subtitle: 'OUR FAN JOURNEY',
      date: date.replaceAll('-', '.'),
      place: place.trim(),
      review: review.trim(),
      icon: '✦',
      image: selectedImage || undefined,
    }

    setRecords((previous) => [newRecord, ...previous])

    setTitle('')
    setCategory('콘서트')
    setDate('')
    setPlace('')
    setReview('')
    setSelectedImage(null)
    setIsFormOpen(false)

    alert('원정 기록이 추가되었어요!')
  }

  return (
    <div className="records-page">

{isFormOpen && (
  <div className="record-modal-overlay">
    <div className="record-modal">
      <div className="record-modal-header">
        <div>
          <span className="section-label">NEW EXPEDITION</span>
          <h2>새로운 원정 기록</h2>
        </div>

        <button
          className="record-modal-close"
          onClick={() => setIsFormOpen(false)}
        >
          ×
        </button>
      </div>

      <p className="record-modal-description">
        소중했던 순간을 우리만의 기록으로 남겨보세요.
      </p>

      
<div className="record-modal-placeholder">
  <input
    id="record-photo"
    type="file"
    accept="image/*"
    style={{ display: 'none' }}
    onChange={(event) => {
      const file = event.target.files?.[0]

      if (file) {
        const reader = new FileReader()

        reader.onload = () => {
          setSelectedImage(reader.result as string)
        }

        reader.readAsDataURL(file)
      }
    }}
  />

  <label htmlFor="record-photo" className="record-photo-label">
    {selectedImage ? (
      <img
        src={selectedImage}
        alt="선택한 원정 기록 사진"
        className="record-photo-preview"
      />
    ) : (
      <>
        <span>＋</span>
        <p>사진 첨부하기</p>
        <small>클릭해서 사진을 선택해 주세요.</small>
      </>
    )}
  </label>

  {selectedImage && (
    <button
      type="button"
      className="record-photo-change"
      onClick={() => {
        setSelectedImage(null)
        const input = document.getElementById('record-photo') as HTMLInputElement
        input.value = ''
      }}
    >
      사진 다시 선택하기
    </button>
  )}
</div>


      <label className="record-modal-label">
        기록 제목
       <input
  placeholder="예: EXO 콘서트 다녀온 날"
  value={title}
  onChange={(event) => setTitle(event.target.value)}
/>
      </label>

      <label className="record-modal-label">
        카테고리
       <select
  value={category}
  onChange={(event) => setCategory(event.target.value)}
>
  <option>콘서트</option>
  <option>무대인사</option>
  <option>팝업스토어</option>
  <option>기타</option>
</select>
      </label>

      <div className="record-modal-row">
        <label className="record-modal-label">
          방문 날짜
        <input
  type="date"
  value={date}
  onChange={(event) => setDate(event.target.value)}
/>
        </label>

        <label className="record-modal-label">
          방문 장소
         <input
  placeholder="방문 장소"
  value={place}
  onChange={(event) => setPlace(event.target.value)}
/>
        </label>
      </div>

      <label className="record-modal-label">
        나의 후기
       <textarea
  placeholder="오늘의 특별했던 순간을 기록해 보세요."
  value={review}
  onChange={(event) => setReview(event.target.value)}
/>
      </label>

      <div className="record-modal-actions">
        <button
          className="record-cancel-button"
          onClick={() => setIsFormOpen(false)}
        >
          취소
        </button>

       <button
  type="button"
  className="record-save-button"
  onClick={handleSave}
>
  기록 저장하기
</button>
      </div>
    </div>
  </div>
)}

      <section className="records-hero">
        <div className="records-hero-content">
          <span className="section-label">OUR EXPEDITION RECORDS</span>
          <h1>우리의 원정 기록</h1>
          <p>
            콘서트, 무대인사, 팝업스토어까지
            <br />
            도경수와 함께한 모든 순간을 기록하는 공간이에요.
          </p>
        </div>
        <div className="records-hero-decoration">
          <span>✦</span>
          <span>OUR DEAREST MOMENTS</span>
        </div>
      </section>

      <section className="records-content">
        <div className="records-toolbar">
          <div className="record-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={
                  selectedCategory === category
                    ? 'record-filter active'
                    : 'record-filter'
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <button
  className="record-add-button"
  onClick={() => setIsFormOpen(true)}
>
  + 기록 추가하기
</button>
        </div>

        <div className="records-list-heading">
          <span>총 {filteredRecords.length}개의 기록</span>
          <span className="records-sort">최신순　⌄</span>
        </div>

        <div className="records-grid">
          {filteredRecords.map((record, index) => (
            <article className="record-card" key={index}>
              <div className={`record-image-placeholder image-${index % 3}`}>
  {record.image ? (
    <img
      src={record.image}
      alt={record.title}
      className="record-card-image"
    />
  ) : (
    <>
      <span>{record.icon}</span>
      <small>{record.category}</small>
    </>
  )}
</div>

              <div className="record-card-content">
                <span className="record-category">
                  {record.category}
                </span>
                <h3>{record.title}</h3>
                <span className="record-subtitle">{record.subtitle}</span>

                <div className="record-meta">
                  <span>▣ {record.date}</span>
                  <span>⌖ {record.place}</span>
                </div>

                <p>{record.review}</p>

                <div className="record-card-bottom">
                  <span>♡ 좋아요</span>
                  <span>댓글 남기기　›</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Records
