import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import 'monaco-editor/min/vs/editor/editor.main.css';
import './MonacoWebEditor.less';

// Vite worker setup for Monaco (ESM workers)
// Map language labels to their respective workers
// These imports are handled by Vite using the `?worker` suffix
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// Ensure MonacoEnvironment is defined for worker resolution
const _self = globalThis as unknown as {
  MonacoEnvironment?: {
    getWorker: (moduleId: string, label: string) => Worker;
  };
};

if (!_self.MonacoEnvironment) {
  _self.MonacoEnvironment = {
    getWorker(_moduleId: string, label: string) {
      if (label === 'json') return new (JsonWorker as unknown as { new (): Worker })();
      if (label === 'css' || label === 'scss' || label === 'less') return new (CssWorker as unknown as { new (): Worker })();
      if (label === 'html' || label === 'handlebars' || label === 'razor') return new (HtmlWorker as unknown as { new (): Worker })();
      if (label === 'typescript' || label === 'javascript') return new (TsWorker as unknown as { new (): Worker })();
      return new (EditorWorker as unknown as { new (): Worker })();
    },
  };
}

type MonacoWebEditorProps = {
  onReady?: (
    monacoNs: typeof monaco,
    editor: monaco.editor.IStandaloneCodeEditor
  ) => void;
  initialContent?: string;
  language: string;
};

export default function MonacoWebEditor({
  onReady,
  initialContent = '',
  language,
}: MonacoWebEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = monaco.editor.create(containerRef.current, {
      value: initialContent,
      language,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      lineHeight: 22,
      fontFamily: '"JetBrains Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      padding: { top: 12, bottom: 12 },
    });

    editorRef.current = editor;
    onReady?.(monaco, editor);

    return () => {
      editor?.dispose();
      editorRef.current = null;
    };
  }, []);

  return <div className="s9-monaco-editor-container" ref={containerRef} />;
}
