import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const SQLEditor = ({ value, onChange, readOnly = false }: SQLEditorProps) => {
  const [editor, setEditor] = useState<any>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);

  // Dynamically load CodeMirror
  useEffect(() => {
    let isMounted = true;
    
    const loadCodeMirror = async () => {
      try {
        // Import CodeMirror and necessary extensions
        const { EditorState, basicSetup } = await import('@codemirror/basic-setup');
        const { EditorView } = await import('@codemirror/view');
        const { sql } = await import('@codemirror/lang-sql');
        const { indentWithTab } = await import('@codemirror/commands');
        const { keymap } = await import('@codemirror/view');
        
        // Create the editor if it doesn't exist yet
        if (isMounted && !editor) {
          const state = EditorState.create({
            doc: value,
            extensions: [
              basicSetup,
              sql(),
              keymap.of([indentWithTab]),
              EditorView.updateListener.of(update => {
                if (update.docChanged && !readOnly) {
                  onChange(update.state.doc.toString());
                }
              }),
              EditorView.theme({
                "&": {
                  backgroundColor: "#202124",
                  color: "white",
                  borderRadius: "0.375rem",
                  height: "auto",
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: "14px",
                },
                ".cm-scroller": {
                  overflow: "auto",
                  maxHeight: "300px",
                  padding: "16px",
                },
                ".cm-content": {
                  caretColor: "#fff",
                  maxHeight: "300px",
                },
                "&.cm-focused": {
                  outline: "none",
                },
                ".cm-line": {
                  padding: "0 4px",
                  lineHeight: "1.6",
                  fontFamily: "'Roboto Mono', monospace",
                },
                ".cm-cursor": {
                  borderLeftColor: "#fff",
                },
              }),
              EditorState.readOnly.of(readOnly)
            ]
          });

          const container = document.getElementById('sql-editor-container');
          if (container) {
            // Clear any existing content
            container.innerHTML = '';
            
            // Create the editor
            const view = new EditorView({
              state,
              parent: container
            });
            
            setEditor(view);
            setEditorLoaded(true);
          }
        }
      } catch (error) {
        console.error("Failed to load CodeMirror:", error);
        // Fallback to a simple textarea if CodeMirror fails to load
        setEditorLoaded(false);
      }
    };
    
    loadCodeMirror();
    
    return () => {
      isMounted = false;
      if (editor) {
        editor.destroy();
      }
    };
  }, []);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.state.doc.toString()) {
      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: value
        }
      });
    }
  }, [value, editor]);

  // If CodeMirror failed to load, show a simple textarea as fallback
  if (!editorLoaded) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[200px] p-4 font-mono text-sm bg-[#202124] text-white rounded-md"
        readOnly={readOnly}
      />
    );
  }

  return (
    <Card className="relative overflow-hidden border-0 bg-[#202124] text-white rounded-md">
      <div id="sql-editor-container" className="min-h-[200px]" />
    </Card>
  );
};

export default SQLEditor;
