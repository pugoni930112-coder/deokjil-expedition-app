import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import './RestaurantMap.css'

type RestaurantCategory = '맛집' | '카페' | '팝업스토어' | '기타'

type FanRestaurant = {
  id: string
  name: string
  address: string
  category: RestaurantCategory
  description: string
  latitude: number
  longitude: number
  created_at: string
}

type RestaurantMapProps = {
  userId?: string
  onRequireSignIn: () => void
}

type PickedLocation = { latitude: number; longitude: number }
type VworldPlace = {
  id: string
  title: string
  category: string
  address: string
  latitude: number
  longitude: number
}

declare global {
  interface Window {
    vw?: any
    ol?: any
  }
}

const apiKey = import.meta.env.VITE_VWORLD_API_KEY?.trim() || ''

const emptyForm = {
  name: '',
  address: '',
  category: '맛집' as RestaurantCategory,
  description: '',
}

function waitForVworldApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now()
    const checkApi = () => {
      if (window.vw?.ol3?.Map && window.ol) {
        resolve()
        return
      }
      if (Date.now() - startedAt > 12000) {
        reject(new Error('브이월드 지도 API를 불러오지 못했어요. 인증키와 등록 도메인을 확인해 주세요.'))
        return
      }
      window.setTimeout(checkApi, 100)
    }
    checkApi()
  })
}

function searchVworldPlaces(query: string): Promise<VworldPlace[]> {
  return new Promise((resolve, reject) => {
    const callbackName = `vworldSearch_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const callbackHost = window as unknown as Record<string, unknown>
    const script = document.createElement('script')
    const params = new URLSearchParams({
      request: 'search',
      type: 'PLACE',
      apiKey,
      query,
      page: '1',
      size: '10',
      crs: 'EPSG:4326',
      callback: callbackName,
    })
    let timeoutId = 0

    const cleanup = () => {
      window.clearTimeout(timeoutId)
      script.remove()
      delete callbackHost[callbackName]
    }

    callbackHost[callbackName] = (payload: any) => {
      cleanup()
      const response = payload?.response
      if (response?.status !== 'OK') {
        if (response?.status === 'NOT_FOUND') {
          resolve([])
          return
        }
        reject(new Error(response?.error?.text || '브이월드 장소 검색에 실패했어요.'))
        return
      }

      const items = Array.isArray(response.result?.items) ? response.result.items : []
      const places = items.flatMap((item: any, index: number) => {
        const longitude = Number(item.point?.x)
        const latitude = Number(item.point?.y)
        if (
          !Number.isFinite(longitude) ||
          !Number.isFinite(latitude) ||
          longitude < -180 || longitude > 180 ||
          latitude < -90 || latitude > 90
        ) return []
        return [{
          id: String(item.id || `${item.title}-${longitude}-${latitude}-${index}`),
          title: String(item.title || '검색한 장소'),
          category: String(item.category || '장소'),
          address: String(item.address?.road || item.address?.parcel || ''),
          latitude,
          longitude,
        }]
      })
      resolve(places)
    }

    script.onerror = () => {
      cleanup()
      reject(new Error('브이월드 검색 서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.'))
    }
    script.src = `https://api.vworld.kr/req/search?${params.toString()}`
    timeoutId = window.setTimeout(() => {
      cleanup()
      reject(new Error('장소 검색 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.'))
    }, 15000)
    document.body.appendChild(script)
  })
}

function RestaurantMap({ userId, onRequireSignIn }: RestaurantMapProps) {
  const mapElement = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const vectorSourceRef = useRef<any>(null)
  const searchVectorSourceRef = useRef<any>(null)
  const isPickingRef = useRef(false)
  const [restaurants, setRestaurants] = useState<FanRestaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<FanRestaurant | null>(null)
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(null)
  const [isPickingLocation, setIsPickingLocation] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMapReady, setIsMapReady] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mapError, setMapError] = useState('')
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [placeQuery, setPlaceQuery] = useState('')
  const [searchResults, setSearchResults] = useState<VworldPlace[]>([])
  const [selectedSearchPlace, setSelectedSearchPlace] = useState<VworldPlace | null>(null)
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false)
  const [placeSearchError, setPlaceSearchError] = useState('')
  const [form, setForm] = useState(emptyForm)

  const loadRestaurants = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false)
      setError('맛집 목록 연결을 준비 중이에요.')
      return
    }

    const { data, error: loadError } = await getSupabaseClient()
      .from('fan_restaurants')
      .select('id, name, address, category, description, latitude, longitude, created_at')
      .order('created_at', { ascending: false })

    if (loadError) {
      setError(`맛집 목록을 불러오지 못했어요: ${loadError.message}`)
      setRestaurants([])
    } else {
      setError('')
      setRestaurants((data || []) as FanRestaurant[])
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void loadRestaurants()
  }, [loadRestaurants])

  useEffect(() => {
    isPickingRef.current = isPickingLocation
  }, [isPickingLocation])

  useEffect(() => {
    if (!apiKey) {
      setMapError('브이월드 인증키를 연결하면 지도를 표시할 수 있어요.')
      return
    }

    let isCancelled = false
    let map: any
    let resizeObserver: ResizeObserver | undefined

    void waitForVworldApi()
      .then(() => {
        if (isCancelled || !mapElement.current) return

        const vw = window.vw
        const ol = window.ol
        vw.ol3.MapOptions = {
          basemapType: vw.ol3.BasemapType.GRAPHIC,
          controlDensity: vw.ol3.DensityType.BASIC,
          interactionDensity: vw.ol3.DensityType.FULL,
          controlsAutoArrange: true,
          homePosition: vw.ol3.CameraPosition,
          initPosition: vw.ol3.CameraPosition,
        }

        const mapId = `restaurant-map-${Math.random().toString(36).slice(2)}`
        mapElement.current.id = mapId
        map = new vw.ol3.Map(mapId, vw.ol3.MapOptions)
        mapRef.current = map

        const center = ol.proj.transform([127.0, 37.5665], 'EPSG:4326', 'EPSG:3857')
        map.getView().setCenter(center)
        map.getView().setZoom(11)

        const source = new ol.source.Vector()
        const markerLayer = new ol.layer.Vector({ source })
        map.addLayer(markerLayer)
        vectorSourceRef.current = source

        const searchSource = new ol.source.Vector()
        const searchMarkerLayer = new ol.layer.Vector({ source: searchSource })
        map.addLayer(searchMarkerLayer)
        searchVectorSourceRef.current = searchSource

        map.on('click', (event: any) => {
          let hit = false
          map.forEachFeatureAtPixel(event.pixel, (feature: any) => {
            const restaurantId = feature.get('restaurantId') as string | undefined
            if (restaurantId) {
              const restaurant = restaurantsRef.current.find((item) => item.id === restaurantId)
              if (restaurant) setSelectedRestaurant(restaurant)
              hit = true
            }
            return true
          })

          if (!hit && isPickingRef.current) {
            const coordinates = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326')
            setPickedLocation({ latitude: coordinates[1], longitude: coordinates[0] })
            setIsPickingLocation(false)
            setIsFormOpen(true)
            setError('')
          }
        })

        resizeObserver = new ResizeObserver(() => map?.updateSize())
        resizeObserver.observe(mapElement.current)
        setMapError('')
        setIsMapReady(true)
        window.setTimeout(() => map?.updateSize(), 100)
      })
      .catch((loadError: Error) => {
        if (!isCancelled) setMapError(loadError.message)
      })

    return () => {
      isCancelled = true
      resizeObserver?.disconnect()
      if (map) map.setTarget(undefined)
      mapRef.current = null
      vectorSourceRef.current = null
      searchVectorSourceRef.current = null
    }
  // restaurantsRef is used in the event handler so map setup does not need to restart for each fetch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const restaurantsRef = useRef(restaurants)
  useEffect(() => {
    restaurantsRef.current = restaurants
  }, [restaurants])

  useEffect(() => {
    if (!vectorSourceRef.current || !window.ol) return
    const ol = window.ol
    const source = vectorSourceRef.current
    source.clear()
    const features = restaurants.map((restaurant) => {
      const feature = new ol.Feature({
        geometry: new ol.geom.Point(
          ol.proj.transform([restaurant.longitude, restaurant.latitude], 'EPSG:4326', 'EPSG:3857'),
        ),
      })
      feature.set('restaurantId', restaurant.id)
      feature.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
          radius: 9,
          fill: new ol.style.Fill({ color: '#c9d0d8' }),
          stroke: new ol.style.Stroke({ color: '#17191c', width: 3 }),
        }),
      }))
      return feature
    })
    source.addFeatures(features)
  }, [restaurants, isMapReady])

  useEffect(() => {
    if (!selectedRestaurant || !mapRef.current || !window.ol) return
    const center = window.ol.proj.transform(
      [selectedRestaurant.longitude, selectedRestaurant.latitude],
      'EPSG:4326',
      'EPSG:3857',
    )
    mapRef.current.getView().animate({ center, zoom: 15, duration: 350 })
  }, [selectedRestaurant, isMapReady])

  useEffect(() => {
    if (!selectedSearchPlace || !mapRef.current || !window.ol) return
    try {
      const center = window.ol.proj.transform(
        [selectedSearchPlace.longitude, selectedSearchPlace.latitude],
        'EPSG:4326',
        'EPSG:3857',
      )
      mapRef.current.getView().setCenter(center)
      mapRef.current.getView().setZoom(16)
    } catch {
      setPlaceSearchError('검색한 위치로 지도를 이동하지 못했어요. 다른 결과를 선택해 주세요.')
    }
  }, [selectedSearchPlace, isMapReady])

  useEffect(() => {
    if (!searchVectorSourceRef.current || !window.ol) return
    const source = searchVectorSourceRef.current
    source.clear()
    if (!selectedSearchPlace) return

    const ol = window.ol
    const feature = new ol.Feature({
      geometry: new ol.geom.Point(
        ol.proj.transform([selectedSearchPlace.longitude, selectedSearchPlace.latitude], 'EPSG:4326', 'EPSG:3857'),
      ),
    })
    feature.setStyle(new ol.style.Style({
      image: new ol.style.Circle({
        radius: 11,
        fill: new ol.style.Fill({ color: '#edc86d' }),
        stroke: new ol.style.Stroke({ color: '#161719', width: 3 }),
      }),
    }))
    source.addFeature(feature)
  }, [selectedSearchPlace, isMapReady])

  const handlePlaceSearch = async (event?: { preventDefault: () => void }) => {
    event?.preventDefault()
    const query = placeQuery.trim()
    if (!query) {
      setPlaceSearchError('찾을 음식점 이름이나 지역을 입력해 주세요.')
      return
    }
    if (!apiKey) {
      setPlaceSearchError('브이월드 인증키가 없어 장소를 검색할 수 없어요.')
      return
    }

    setIsSearchingPlaces(true)
    setPlaceSearchError('')
    setSearchResults([])
    setSelectedSearchPlace(null)
    try {
      const places = await searchVworldPlaces(query)
      setSearchResults(places)
      if (places.length > 0) {
        setSelectedSearchPlace(places[0])
      } else {
        setPlaceSearchError('검색 결과가 없어요. 음식점 이름이나 지역명을 바꿔 검색해 주세요.')
      }
    } catch (searchError) {
      setPlaceSearchError(searchError instanceof Error ? searchError.message : '장소 검색에 실패했어요.')
    } finally {
      setIsSearchingPlaces(false)
    }
  }

  const beginAddingRestaurant = () => {
    if (!userId) {
      onRequireSignIn()
      return
    }
    if (!apiKey || !mapRef.current) {
      setError('브이월드 인증키를 연결한 뒤 지도에서 위치를 선택할 수 있어요.')
      return
    }
    setSelectedRestaurant(null)
    setPickedLocation(null)
    setForm(emptyForm)
    setIsFormOpen(false)
    setIsPickingLocation(true)
    setError('지도에서 맛집 위치를 눌러 주세요.')
  }

  const cancelAddingRestaurant = () => {
    setIsPickingLocation(false)
    setIsFormOpen(false)
    setPickedLocation(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId) {
      onRequireSignIn()
      return
    }
    if (!pickedLocation) {
      setError('먼저 지도에서 맛집 위치를 선택해 주세요.')
      return
    }

    setIsSaving(true)
    setError('')
    const { error: saveError } = await getSupabaseClient()
      .from('fan_restaurants')
      .insert({
        user_id: userId,
        name: form.name.trim(),
        address: form.address.trim(),
        category: form.category,
        description: form.description.trim(),
        latitude: pickedLocation.latitude,
        longitude: pickedLocation.longitude,
      })

    setIsSaving(false)
    if (saveError) {
      setError(`맛집을 등록하지 못했어요: ${saveError.message}`)
      return
    }

    cancelAddingRestaurant()
    await loadRestaurants()
  }

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const query = searchText.trim().toLocaleLowerCase('ko-KR')
    return !query || `${restaurant.name} ${restaurant.address} ${restaurant.category}`.toLocaleLowerCase('ko-KR').includes(query)
  })

  return (
    <section className="restaurant-map-page">
      <div className="restaurant-map-heading">
        <span className="section-label">FAN SPOT MAP</span>
        <h1>도경수 맛집 지도</h1>
        <p>좋아하는 마음으로 찾은 맛집과 덕질 코스를 팬들과 나눠요.</p>
      </div>

      <div className="restaurant-map-toolbar">
        <span>브이월드 2D 지도 · 팬 추천 장소</span>
        <button type="button" onClick={beginAddingRestaurant}>
          {userId ? '+ 맛집 등록' : '로그인 후 맛집 등록'}
        </button>
      </div>

      {error && <p className="restaurant-map-message" role="status">{error}</p>}
      {isPickingLocation && (
        <p className="restaurant-map-pick-hint">지도에서 장소를 눌러 위치를 지정해 주세요. <button type="button" onClick={cancelAddingRestaurant}>취소</button></p>
      )}

      <div className="restaurant-map-layout">
        <div className="restaurant-map-main">
          <div className="restaurant-place-search">
            <form className="restaurant-place-search-form" onSubmit={handlePlaceSearch}>
              <input
                value={placeQuery}
                onChange={(event) => setPlaceQuery(event.target.value)}
                placeholder="음식점 이름이나 지역을 검색하세요"
                aria-label="브이월드 음식점 및 장소 검색"
              />
              <button type="button" onClick={(event) => void handlePlaceSearch(event)} disabled={isSearchingPlaces}>
                {isSearchingPlaces ? '검색 중…' : '지도 검색'}
              </button>
            </form>
            {placeSearchError && <p className="restaurant-place-search-message" role="status">{placeSearchError}</p>}
            {searchResults.length > 0 && (
              <div className="restaurant-place-search-results" aria-label="브이월드 검색 결과">
                {searchResults.map((place) => (
                  <button
                    className={selectedSearchPlace?.id === place.id ? 'is-selected' : ''}
                    type="button"
                    key={place.id}
                    onClick={() => setSelectedSearchPlace(place)}
                  >
                    <strong>{place.title}</strong>
                    <span>{[place.category, place.address].filter(Boolean).join(' · ')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={`restaurant-map-canvas${isPickingLocation ? ' is-picking' : ''}`} ref={mapElement} aria-label="브이월드 맛집 지도">
            {mapError && (
              <div className="restaurant-map-key-notice">
                <span aria-hidden="true">⌖</span>
                <h2>브이월드 지도를 연결해 주세요</h2>
                <p>{mapError}</p>
                <a href="https://www.vworld.kr/dev/v4dv_opn2dmap2guide_s001.do" target="_blank" rel="noreferrer">브이월드 API 안내 ↗</a>
              </div>
            )}
          </div>

          {isFormOpen && (
            <form className="restaurant-form" onSubmit={handleSubmit}>
              <div className="restaurant-form-heading">
                <div>
                  <span className="section-label">ADD A FAN SPOT</span>
                  <h2>맛집 정보 등록</h2>
                </div>
                <button type="button" onClick={cancelAddingRestaurant} aria-label="등록 취소">×</button>
              </div>
              <p className="restaurant-picked-coordinates">
                선택 위치 · {pickedLocation?.latitude.toFixed(5)}, {pickedLocation?.longitude.toFixed(5)}
              </p>
              <label>장소 이름<input required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="예: 경수 추천 카페" /></label>
              <label>주소 (선택)<input maxLength={250} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="동네나 도로명 주소" /></label>
              <label>분류<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as RestaurantCategory })}><option>맛집</option><option>카페</option><option>팝업스토어</option><option>기타</option></select></label>
              <label>추천 이유<textarea rows={3} maxLength={1200} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="팬들과 나누고 싶은 정보를 적어 주세요." /></label>
              <p className="restaurant-form-safety">개인 연락처 등 민감한 정보는 입력하지 말아 주세요.</p>
              <button className="restaurant-form-submit" type="submit" disabled={isSaving}>{isSaving ? '등록 중…' : '맛집 등록하기'}</button>
            </form>
          )}
        </div>

        <aside className="restaurant-map-sidebar">
          <div className="restaurant-list-heading">
            <div><span className="section-label">FAN PICKS</span><h2>팬 추천 장소</h2></div>
            <span>{filteredRestaurants.length}</span>
          </div>
          <input className="restaurant-map-search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="등록된 팬 추천 장소 검색" aria-label="등록된 팬 추천 장소 검색" />
          {isLoading ? (
            <p className="restaurant-list-empty">장소를 불러오는 중이에요…</p>
          ) : filteredRestaurants.length === 0 ? (
            <div className="restaurant-list-empty"><span aria-hidden="true">✦</span><p>{restaurants.length ? '검색 결과가 없어요.' : '아직 등록된 장소가 없어요.'}</p></div>
          ) : (
            <div className="restaurant-list">
              {filteredRestaurants.map((restaurant) => (
                <button className={`restaurant-list-card${selectedRestaurant?.id === restaurant.id ? ' is-selected' : ''}`} type="button" key={restaurant.id} onClick={() => setSelectedRestaurant(restaurant)}>
                  <span className="restaurant-category">{restaurant.category}</span>
                  <strong>{restaurant.name}</strong>
                  {restaurant.address && <span className="restaurant-address">{restaurant.address}</span>}
                  {restaurant.description && <span className="restaurant-description">{restaurant.description}</span>}
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>

      <p className="restaurant-map-attribution">지도 데이터 제공: 브이월드 · 장소 정보는 팬 커뮤니티의 추천으로 등록됩니다.</p>
    </section>
  )
}

export default RestaurantMap
