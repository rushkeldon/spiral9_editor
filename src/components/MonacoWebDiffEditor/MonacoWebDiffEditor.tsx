import { useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor'
import './MonacoWebDiffEditor.less'

export type MonacoWebDiffEditorProps = {
  original: string
  modified: string
  language?: string
  options?: monaco.editor.IDiffEditorOptions
  editorOptions?: monaco.editor.IStandaloneEditorConstructionOptions
  onReady?: (m: typeof monaco, diff: monaco.editor.IStandaloneDiffEditor) => void
}

export default function MonacoWebDiffEditor({
  original,
  modified,
  language = 'typescript',
  options = {},
  editorOptions = {},
  onReady,
}: MonacoWebDiffEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const diffRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null)
  const originalModelRef = useRef<monaco.editor.ITextModel | null>(null)
  const modifiedModelRef = useRef<monaco.editor.ITextModel | null>(null)

  // Create once
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Create models
    const originalModel = monaco.editor.createModel(original ?? '', language)
    const modifiedModel = monaco.editor.createModel(modified ?? '', language)
    originalModelRef.current = originalModel
    modifiedModelRef.current = modifiedModel

    // Create diff editor
    const diff = monaco.editor.createDiffEditor(el, {
      theme: 'vs-dark',
      renderSideBySide: true,
      automaticLayout: true,
      // sensible defaults; will be overridden by 'options' below if provided
      readOnly: false,
      ...options,
    })
    diffRef.current = diff

    diff.setModel({ original: originalModel, modified: modifiedModel })

    // Apply inner editor options (font, padding, etc.)
    const innerOpts: monaco.editor.IStandaloneEditorConstructionOptions = {
      fontFamily:
        '"JetBrains Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: 14,
      lineHeight: 22,
      minimap: { enabled: false },
      smoothScrolling: true,
      padding: { top: 12, bottom: 12 },
      ...editorOptions,
    }
    diff.getOriginalEditor().updateOptions(innerOpts)
    diff.getModifiedEditor().updateOptions(innerOpts)

    onReady?.(monaco, diff)

    return () => {
      diff.dispose()
      originalModel.dispose()
      modifiedModel.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // React to text changes
  useEffect(() => {
    if (!originalModelRef.current) return
    if (originalModelRef.current.getValue() !== original) {
      originalModelRef.current.setValue(original ?? '')
    }
  }, [original])

  useEffect(() => {
    if (!modifiedModelRef.current) return
    if (modifiedModelRef.current.getValue() !== modified) {
      modifiedModelRef.current.setValue(modified ?? '')
    }
  }, [modified])

  // React to language changes
  useEffect(() => {
    if (originalModelRef.current) {
      monaco.editor.setModelLanguage(originalModelRef.current, language)
    }
    if (modifiedModelRef.current) {
      monaco.editor.setModelLanguage(modifiedModelRef.current, language)
    }
  }, [language])

  // React to option changes
  useEffect(() => {
    if (diffRef.current) diffRef.current.updateOptions(options ?? {})
  }, [options])

  useEffect(() => {
    if (!diffRef.current) return
    const innerOpts = editorOptions ?? {}
    diffRef.current.getOriginalEditor().updateOptions(innerOpts)
    diffRef.current.getModifiedEditor().updateOptions(innerOpts)
  }, [editorOptions])

  return <div ref={containerRef} className="monaco-diff-container" />
}
