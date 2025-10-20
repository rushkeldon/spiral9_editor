import { type ReactNode, type SyntheticEvent, useEffect, useRef, useState } from 'react'
import './App.less'
import CrepeEditor from '../CrepeEditor/CrepeEditor.tsx'
import MonacoWebEditor from '../MonacoWebEditor/MonacoWebEditor.tsx'

// MUI (only for tabs; layout/styling will be handled in LESS)
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

const MinKey = { Left: 'minLeft', Right: 'minRight', Bottom: 'minBottom' } as const;

// Small helper to switch visible content
function TabPanel({ children, value, index }: { children: ReactNode; value: number; index: number }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      className="tab-panel"
    >
      {value === index && children}
    </div>
  )
}

// Minimal resizer logic for CSS Grid columns/rows using CSS variables:
// --frame-width-left (px), --frame-width-right (px), --frame-height-bottom (px)
function useGridResizers(
  rootRef: React.RefObject<HTMLDivElement | null>,
  opts?: {
    minLeft: boolean; setMinLeft: (v: boolean) => void;
    minRight: boolean; setMinRight: (v: boolean) => void;
    minBottom: boolean; setMinBottom: (v: boolean) => void;
  }
) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // restore saved sizes
    const lw = localStorage.getItem('frameWidthLeft')
    const rw = localStorage.getItem('frameWidthRight')
    const th = localStorage.getItem('frameHeightBottom')
    if (lw) root.style.setProperty('--frame-width-left', `${lw}px`)
    if (rw) root.style.setProperty('--frame-width-right', `${rw}px`)
    if (th) root.style.setProperty('--frame-height-bottom', `${th}px`)

    let startX = 0
    let startY = 0
    let startLeft = 280
    let startRight = 320
    let startTerm = 180
    let active: 'left' | 'right' | 'bottom' | null = null

    const onMouseMove = (e: MouseEvent) => {
      if (!active) return
      if (active === 'left') {
        const dx = e.clientX - startX
        const w = Math.max(160, startLeft + dx)
        root.style.setProperty('--frame-width-left', `${w}px`)
      } else if (active === 'right') {
        const dx = e.clientX - startX
        const w = Math.max(200, startRight - dx)
        root.style.setProperty('--frame-width-right', `${w}px`)
      } else if (active === 'bottom') {
        const dy = e.clientY - startY
        const h = Math.max(120, startTerm - dy)
        root.style.setProperty('--frame-height-bottom', `${h}px`)
      }
    }

    const onMouseUp = () => {
      if (!active) return
      // persist
      const leftNow = parseInt(getComputedStyle(root).getPropertyValue('--frame-width-left')) || startLeft
      const rightNow = parseInt(getComputedStyle(root).getPropertyValue('--frame-width-right')) || startRight
      const termNow = parseInt(getComputedStyle(root).getPropertyValue('--frame-height-bottom')) || startTerm
      localStorage.setItem('frameWidthLeft', String(leftNow))
      localStorage.setItem('frameWidthRight', String(rightNow))
      localStorage.setItem('frameHeightBottom', String(termNow))
      active = null
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const handle = target.closest('.resizer') as HTMLElement | null
      if (!handle) return
      const side = handle.getAttribute('data-side') as 'left' | 'right' | 'bottom' | null
      if (!side) return
      // Save minimized state at drag start
      const wasMinLeft = opts?.minLeft ?? false
      const wasMinRight = opts?.minRight ?? false
      const wasMinBottom = opts?.minBottom ?? false
      // If the user begins dragging a minimized pane, auto-unminimize it
      const bodyEl = root.querySelector('.body') as HTMLElement | null;
      if (side === 'left' && opts && opts.minLeft) {
        opts.setMinLeft(false);
        localStorage.setItem(MinKey.Left, '0');
        // remove class immediately so grid-template-columns uses --frame-width-left
        bodyEl?.classList.remove('min-left');
      }
      if (side === 'right' && opts && opts.minRight) {
        opts.setMinRight(false);
        localStorage.setItem(MinKey.Right, '0');
        bodyEl?.classList.remove('min-right');
      }
      if (side === 'bottom' && opts && opts.minBottom) {
        opts.setMinBottom(false);
        localStorage.setItem(MinKey.Bottom, '0');
        // remove class from shell so grid-template-rows uses current --frame-height-bottom
        root.classList.remove('min-bottom');
      }
      active = side
      startX = e.clientX
      startY = e.clientY
      const cs = getComputedStyle(root)
      const sizeMin = parseInt(cs.getPropertyValue('--frame-size-min')) || 36
      startLeft = parseInt(cs.getPropertyValue('--frame-width-left')) || 280
      startRight = parseInt(cs.getPropertyValue('--frame-width-right')) || 320
      startTerm = parseInt(cs.getPropertyValue('--frame-height-bottom')) || 180
      if (wasMinLeft && side === 'left') startLeft = sizeMin
      if (wasMinRight && side === 'right') startRight = sizeMin
      if (wasMinBottom && side === 'bottom') startTerm = sizeMin
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
      e.preventDefault()
    }

    root.addEventListener('mousedown', onMouseDown)
    return () => {
      root.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [rootRef])
}

function App() {
  const [tabIndex, setTabIndex] = useState(0)
  const refShell = useRef<HTMLDivElement>(null)
  const [minLeft, setMinLeft] = useState<boolean>(() => localStorage.getItem(MinKey.Left) === '1')
  const [minRight, setMinRight] = useState<boolean>(() => localStorage.getItem(MinKey.Right) === '1')
  const [minBottom, setMinBottom] = useState<boolean>(() => localStorage.getItem(MinKey.Bottom) === '1')
  useGridResizers(refShell, {
    minLeft, setMinLeft,
    minRight, setMinRight,
    minBottom, setMinBottom,
  })


  const toggleMinLeft = () => {
    const v = !minLeft
    setMinLeft(v)
    localStorage.setItem(MinKey.Left, v ? '1' : '0')
  }
  const toggleMinRight = () => {
    const v = !minRight
    setMinRight(v)
    localStorage.setItem(MinKey.Right, v ? '1' : '0')
  }
  const toggleMinBottom = () => {
    const v = !minBottom
    setMinBottom(v)
    localStorage.setItem(MinKey.Bottom, v ? '1' : '0')
    const root = refShell.current
    if (root) {
      if (v) {
        // Minimize: use the shared min size regardless of previously restored px
        root.style.setProperty('--frame-height-bottom', 'var(--frame-size-min)')
      } else {
        // Restore: apply the last saved height or a sensible default
        const saved = localStorage.getItem('frameHeightBottom')
        const px = saved ? `${parseInt(saved, 10)}px` : '180px'
        root.style.setProperty('--frame-height-bottom', px)
      }
    }
  }

  useEffect(() => {
    const root = refShell.current
    if (!root) return
    if (minBottom) {
      root.style.setProperty('--frame-height-bottom', 'var(--frame-size-min)')
    } else {
      const saved = localStorage.getItem('frameHeightBottom')
      if (saved) {
        root.style.setProperty('--frame-height-bottom', `${parseInt(saved, 10)}px`)
      }
    }
  }, [minBottom])

  function handleChange(_event: SyntheticEvent, newValue: number) {
    setTabIndex(newValue)
  }

  function crepeEditorisReady(crepe: any, editor: any) {
    console.log('Crepe editor is ready:', crepe, editor)
  }

  return (
    <div className={`shell${minBottom ? ' min-bottom' : ''}`} ref={refShell}>
      {/* Top menu bar */}
      <div className="menuBar">
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar variant="dense">
            <Typography variant="h6" component="div">menuBar</Typography>
          </Toolbar>
        </AppBar>
      </div>

      {/* Body grid: left | resizer | editor | resizer | right */}
      <div className={`body${minLeft ? ' min-left' : ''}${minRight ? ' min-right' : ''}`}>
        <div className="frame projectTree">
          <button className="min-btn" onClick={toggleMinLeft} aria-label="Minimize left panel"><span/></button>
          projectTree
        </div>
        <div className="resizer resizer-left" data-side="left" />

        <div className="frame editor">
          <div className="tabs-header">
            <Tabs
              value={tabIndex}
              onChange={handleChange}
              indicatorColor="primary"
            >
              <Tab label="Monaco Editor" id="tab-0" aria-controls="tabpanel-0" />
              <Tab label="Crepe Editor" id="tab-1" aria-controls="tabpanel-1" />
            </Tabs>
          </div>

          <div className="editor-pane">
            <TabPanel value={tabIndex} index={0}>
              <MonacoWebEditor
                onReady={(monaco, editor) => {
                  console.log('Monaco editor is ready:', monaco, editor)
                }}
                initialContent="console.log('Hello, Monaco!');"
                language="typescript"
              />
            </TabPanel>

            <TabPanel value={tabIndex} index={1}>
              <CrepeEditor
                onReady={crepeEditorisReady}
                initialContent="spiral9 editor"
              />
            </TabPanel>
          </div>
        </div>

        <div className="resizer resizer-right" data-side="right" />
        <div className="frame rightSidebar">
          <button className="min-btn" onClick={toggleMinRight} aria-label="Minimize right panel"><span/></button>
          rightSideBar | AI | …
        </div>
      </div>

      {/* Horizontal resizer between body and terminal */}
      <div className="resizer resizer-bottom" data-side="bottom" />

      {/* Bottom terminal frame */}
      <div className="frame terminal">
        <button className="min-btn" onClick={toggleMinBottom} aria-label="Minimize bottom panel"><span/></button>
        terminal | run | git
      </div>
    </div>
  )
}

export default App
