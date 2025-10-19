import './App.less'
import CrepeEditor from '../CrepeEditor/CrepeEditor.tsx';

// Simple js-signals usage: a signal that dispatches an increment amount

function App() {

  function crepeEditorisReady(crepe: any, editor: any) {
    console.log('Crepe editor is ready:', crepe, editor)
  }

  return (
    <div className="app">
      <CrepeEditor
        onReady={crepeEditorisReady}
        initialContent="spiral9 editor"
      />
    </div>
  )
}

export default App
