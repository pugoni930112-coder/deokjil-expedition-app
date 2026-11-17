import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import './Marketplace.css'

type ListingType = 'photocard_exchange' | 'goods_sale'
type ItemCondition = '미개봉' | '새상품' | '상태 좋음' | '사용감 있음'

type MarketplacePost = {
  id: string
  listing_type: ListingType
  artist_name: string
  item_name: string
  desired_item: string | null
  item_condition: ItemCondition
  price_krw: number | null
  description: string
  status: 'open' | 'reserved' | 'completed'
  created_at: string
}

type MarketplaceProps = {
  listingType: ListingType
  userId?: string
  onRequireSignIn: () => void
}

const emptyForm = {
  artistName: '도경수 · EXO',
  itemName: '',
  desiredItem: '',
  condition: '상태 좋음' as ItemCondition,
  price: '',
  description: '',
}

function Marketplace({ listingType, userId, onRequireSignIn }: MarketplaceProps) {
  const isExchange = listingType === 'photocard_exchange'
  const [posts, setPosts] = useState<MarketplacePost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)

  const loadPosts = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setPosts([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const { data, error: loadError } = await getSupabaseClient()
      .from('fan_marketplace_posts')
      .select('id, listing_type, artist_name, item_name, desired_item, item_condition, price_krw, description, status, created_at')
      .eq('listing_type', listingType)
      .in('status', ['open', 'reserved'])
      .order('created_at', { ascending: false })

    if (loadError) {
      setError(`게시글을 불러오지 못했어요: ${loadError.message}`)
      setPosts([])
    } else {
      setError('')
      setPosts((data || []) as MarketplacePost[])
    }
    setIsLoading(false)
  }, [listingType])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  const handleCreateClick = () => {
    if (!isSupabaseConfigured()) {
      setError('게시판 연결 설정을 완료하면 글을 등록할 수 있어요.')
      return
    }
    if (!userId) {
      onRequireSignIn()
      return
    }
    setError('')
    setIsFormOpen(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!userId) {
      onRequireSignIn()
      return
    }

    const itemName = form.itemName.trim()
    const desiredItem = form.desiredItem.trim()
    const price = Number(form.price)
    if (!itemName || (isExchange && !desiredItem) || (!isExchange && (!Number.isFinite(price) || price <= 0))) {
      setError(isExchange ? '교환할 포카와 원하는 포카를 입력해 주세요.' : '굿즈 이름과 판매 가격을 입력해 주세요.')
      return
    }

    setIsSaving(true)
    const { error: saveError } = await getSupabaseClient()
      .from('fan_marketplace_posts')
      .insert({
        user_id: userId,
        listing_type: listingType,
        artist_name: form.artistName.trim() || '도경수 · EXO',
        item_name: itemName,
        desired_item: isExchange ? desiredItem : null,
        item_condition: form.condition,
        price_krw: isExchange ? null : price,
        description: form.description.trim(),
      })

    setIsSaving(false)
    if (saveError) {
      setError(`글을 저장하지 못했어요: ${saveError.message}`)
      return
    }

    setForm(emptyForm)
    setIsFormOpen(false)
    await loadPosts()
  }

  return (
    <section className="marketplace-page">
      <div className="marketplace-heading">
        <span className="section-label">FAN MARKET</span>
        <h1>{isExchange ? '포카 교환' : '굿즈 판매'}</h1>
        <p>{isExchange ? '서로 찾는 포카를 확인하고 교환 글을 올려보세요.' : '소장한 굿즈를 소개하고 판매 글을 올려보세요.'}</p>
      </div>

      <div className="marketplace-toolbar">
        <div className="marketplace-tabs" aria-label="팬 마켓 종류">
          <Link className={isExchange ? 'active' : ''} to="/market/photocards">포카 교환</Link>
          <Link className={!isExchange ? 'active' : ''} to="/market/goods">굿즈 판매</Link>
        </div>
        <button className="marketplace-create-button" type="button" onClick={handleCreateClick}>
          + 글쓰기
        </button>
      </div>

      {!isSupabaseConfigured() && (
        <p className="marketplace-connection-note">
          게시판 연결을 준비 중이에요. 연결 후 실제 게시글을 보고 등록할 수 있어요.
        </p>
      )}
      {error && <p className="marketplace-error" role="alert">{error}</p>}

      {isLoading ? (
        <p className="marketplace-empty">게시글을 불러오는 중이에요…</p>
      ) : posts.length === 0 ? (
        <div className="marketplace-empty">
          <span aria-hidden="true">{isExchange ? '♡' : '✦'}</span>
          <h2>아직 등록된 글이 없어요</h2>
          <p>{isExchange ? '첫 교환 글을 올려 팬 마켓을 시작해 주세요.' : '첫 굿즈 판매 글을 올려보세요.'}</p>
        </div>
      ) : (
        <div className="marketplace-grid">
          {posts.map((post) => (
            <article className="marketplace-card" key={post.id}>
              <div className="marketplace-card-topline">
                <span className="marketplace-status">{post.status === 'reserved' ? '예약중' : '교환 가능'}</span>
                <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString('ko-KR')}</time>
              </div>
              <span className="marketplace-artist">{post.artist_name}</span>
              <h2>{post.item_name}</h2>
              <p className="marketplace-condition">상태 · {post.item_condition}</p>
              {isExchange ? (
                <p className="marketplace-desired"><span>찾는 포카</span>{post.desired_item}</p>
              ) : (
                <p className="marketplace-price">{(post.price_krw || 0).toLocaleString('ko-KR')}원</p>
              )}
              {post.description && <p className="marketplace-description">{post.description}</p>}
              <p className="marketplace-contact-note">문의와 결제 기능은 준비 중이에요.</p>
            </article>
          ))}
        </div>
      )}

      <aside className="marketplace-safety">
        <h2>안전한 거래를 위해</h2>
        <p>개인 연락처나 주소를 게시글에 적지 마세요. 직거래는 안전한 공개 장소에서 진행하고, 결제 전 상품과 거래 조건을 충분히 확인해 주세요.</p>
      </aside>

      {isFormOpen && (
        <div className="record-modal-overlay" onClick={() => !isSaving && setIsFormOpen(false)}>
          <section
            className="record-modal marketplace-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="marketplace-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="record-modal-header">
              <div>
                <span className="section-label">FAN MARKET</span>
                <h2 id="marketplace-modal-title">{isExchange ? '포카 교환 글쓰기' : '굿즈 판매 글쓰기'}</h2>
              </div>
              <button className="record-modal-close" type="button" onClick={() => setIsFormOpen(false)} aria-label="글쓰기 창 닫기">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="record-modal-label">
                아티스트 / 그룹
                <input maxLength={60} value={form.artistName} onChange={(event) => setForm({ ...form, artistName: event.target.value })} />
              </label>
              <label className="record-modal-label">
                {isExchange ? '교환할 포카' : '굿즈 이름'}
                <input required maxLength={100} value={form.itemName} onChange={(event) => setForm({ ...form, itemName: event.target.value })} placeholder={isExchange ? '예: 시즌그리팅 포카' : '예: 공식 응원봉'} />
              </label>
              {isExchange ? (
                <label className="record-modal-label">
                  원하는 포카
                  <input required maxLength={120} value={form.desiredItem} onChange={(event) => setForm({ ...form, desiredItem: event.target.value })} placeholder="찾고 있는 포카를 적어주세요" />
                </label>
              ) : (
                <label className="record-modal-label">
                  판매 가격 (원)
                  <input required type="number" min="1" step="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="예: 30000" />
                </label>
              )}
              <label className="record-modal-label">
                상품 상태
                <select value={form.condition} onChange={(event) => setForm({ ...form, condition: event.target.value as ItemCondition })}>
                  <option>미개봉</option>
                  <option>새상품</option>
                  <option>상태 좋음</option>
                  <option>사용감 있음</option>
                </select>
              </label>
              <label className="record-modal-label">
                상세 설명
                <textarea maxLength={1200} rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="상품 상태나 교환 조건을 적어주세요." />
              </label>
              <p className="marketplace-form-hint">전화번호, 주소, 계좌번호 등 개인정보는 적지 마세요.</p>
              {error && <p className="marketplace-error" role="alert">{error}</p>}
              <div className="record-modal-actions">
                <button className="record-cancel-button" type="button" disabled={isSaving} onClick={() => setIsFormOpen(false)}>취소</button>
                <button className="record-save-button" type="submit" disabled={isSaving}>{isSaving ? '등록 중…' : '게시글 등록'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

export default Marketplace
