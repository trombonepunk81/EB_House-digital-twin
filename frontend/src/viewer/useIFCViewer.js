import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { IFCLoader } from 'web-ifc-three/IFCLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useViewerStore } from '../store/viewerStore'

export function useIFCViewer(containerRef) {
  const rendererRef  = useRef(null)
  const sceneRef     = useRef(null)
  const cameraRef    = useRef(null)
  const controlsRef  = useRef(null)
  const ifcLoaderRef = useRef(null)
  const modelRef     = useRef(null)
  const rafRef       = useRef(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef     = useRef(new THREE.Vector2())

  const { setSelectedElement, setLoadingState, setModelMetadata } = useViewerStore()

  // ── Init scene ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const W = container.clientWidth
    const H = container.clientHeight

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0b0e)
    scene.fog = new THREE.FogExp2(0x0a0b0e, 0.005)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    camera.position.set(20, 15, 20)
    cameraRef.current = camera

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.minDistance = 1
    controls.maxDistance = 200
    controlsRef.current = controls

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xffeedd, 2)
    sun.position.set(30, 50, 20)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 200
    sun.shadow.camera.left = -50
    sun.shadow.camera.right = 50
    sun.shadow.camera.top = 50
    sun.shadow.camera.bottom = -50
    scene.add(sun)

    const fill = new THREE.DirectionalLight(0xaabbff, 0.5)
    fill.position.set(-20, 10, -10)
    scene.add(fill)

    // Grid
    const grid = new THREE.GridHelper(100, 50, 0x1a1d26, 0x1a1d26)
    scene.add(grid)

    // IFC Loader
    const ifcLoader = new IFCLoader()
    ifcLoader.ifcManager.setWasmPath('/wasm/')
    ifcLoader.ifcManager.setupThreeMeshBVH(
      // Optional: for better raycasting perf — safe to omit for v1
    )
    ifcLoaderRef.current = ifcLoader

    // Animate
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafRef.current)
      controls.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  // ── Load IFC file ────────────────────────────────────────────────────────────
  const loadIFC = useCallback(async (file) => {
    if (!ifcLoaderRef.current || !sceneRef.current) return

    setLoadingState({ loading: true, progress: 0, error: null })

    // Remove previous model
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current)
      ifcLoaderRef.current.ifcManager.disposeMemory()
      modelRef.current = null
    }

    try {
      const url = URL.createObjectURL(file)

      const model = await ifcLoaderRef.current.loadAsync(
        url,
        (event) => {
          const pct = Math.round((event.loaded / event.total) * 100)
          setLoadingState({ loading: true, progress: pct, error: null })
        }
      )

      URL.revokeObjectURL(url)
      sceneRef.current.add(model)
      modelRef.current = model

      // Frame model in view
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      cameraRef.current.position.set(
        center.x + maxDim,
        center.y + maxDim * 0.8,
        center.z + maxDim
      )
      controlsRef.current.target.copy(center)
      controlsRef.current.update()

      // Extract metadata
      const modelID = model.modelID
      const allTypes = await ifcLoaderRef.current.ifcManager.getAllItemsOfType(modelID, 0, false)
      setModelMetadata({ modelID, elementCount: allTypes.length, fileName: file.name })
      setLoadingState({ loading: false, progress: 100, error: null })

    } catch (err) {
      console.error('IFC load error:', err)
      setLoadingState({ loading: false, progress: 0, error: err.message })
    }
  }, [setLoadingState, setModelMetadata])

  // ── Raycasting / element picking ─────────────────────────────────────────────
  const handleClick = useCallback(async (event) => {
    if (!rendererRef.current || !modelRef.current) return

    const rect = rendererRef.current.domElement.getBoundingClientRect()
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
    const intersects = raycasterRef.current.intersectObjects([modelRef.current], true)

    if (!intersects.length) {
      setSelectedElement(null)
      return
    }

    try {
      const modelID = modelRef.current.modelID
      const index = intersects[0].faceIndex
      const expressID = ifcLoaderRef.current.ifcManager.getExpressId(
        intersects[0].object.geometry,
        index
      )
      const props = await ifcLoaderRef.current.ifcManager.getItemProperties(modelID, expressID)
      const psets  = await ifcLoaderRef.current.ifcManager.getPropertySets(modelID, expressID, true)
      setSelectedElement({ expressID, props, psets })
    } catch (err) {
      console.warn('Failed to get element properties:', err)
    }
  }, [setSelectedElement])

  return { handleClick, loadIFC }
}
