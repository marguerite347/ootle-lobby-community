import {useEffect,useRef} from 'react';
import {basicSetup} from 'codemirror';
import {EditorView,keymap} from '@codemirror/view';
import {EditorState,Compartment} from '@codemirror/state';
import {HighlightStyle,syntaxHighlighting} from '@codemirror/language';
import {tags} from '@lezer/highlight';
import {indentWithTab} from '@codemirror/commands';
import {rust} from '@codemirror/lang-rust';
import {json} from '@codemirror/lang-json';
import {javascript} from '@codemirror/lang-javascript';
import {html} from '@codemirror/lang-html';
import {markdown} from '@codemirror/lang-markdown';
const language=(path:string)=>path.endsWith('.rs')?rust():path.endsWith('.json')?json():/\.[jt]sx?$/.test(path)?javascript({typescript:true,jsx:path.endsWith('x')}):path.endsWith('.html')?html():path.endsWith('.md')?markdown():[];
const highlighting=HighlightStyle.define([{tag:tags.keyword,color:'#c6a6ff'},{tag:tags.string,color:'#d5e993'},{tag:tags.comment,color:'#9390a3'},{tag:tags.number,color:'#efc789'},{tag:tags.typeName,color:'#86d5d2'},{tag:tags.function(tags.variableName),color:'#e8d7ff'}]);
const theme=EditorView.theme({
 '&':{height:'100%',backgroundColor:'#171727',color:'#e4dff2',fontSize:'14px'},
 '.cm-scroller':{overflow:'auto',fontFamily:'"SFMono-Regular",Consolas,monospace',lineHeight:'1.65'},
 '.cm-content':{padding:'16px 0',caretColor:'#d5f544'},
 '.cm-gutters':{backgroundColor:'#171727',color:'#77758c',border:'none',paddingRight:'12px'},
 '.cm-activeLine,.cm-activeLineGutter':{backgroundColor:'#c8b6f50b'},
 '&.cm-focused .cm-selectionBackground,.cm-selectionBackground':{backgroundColor:'#72579866'},
 '.cm-cursor':{borderLeftColor:'#d5f544'},
 '.cm-panels':{backgroundColor:'#242237',color:'#eee'},
 '.cm-tooltip':{backgroundColor:'#242237',borderColor:'#4c4461'},
 '.cm-searchMatch':{backgroundColor:'#b89aff33'},
},{dark:true});
export default function CodeEditor({path,value,onChange}:{path:string;value:string;onChange:(value:string)=>void}){
 const host=useRef<HTMLDivElement>(null),view=useRef<EditorView>(),callback=useRef(onChange),lang=useRef(new Compartment());
 callback.current=onChange;
 useEffect(()=>{
  const editor=new EditorView({parent:host.current!,state:EditorState.create({doc:value,extensions:[basicSetup,theme,syntaxHighlighting(highlighting),lang.current.of(language(path)),keymap.of([indentWithTab]),EditorView.contentAttributes.of({'aria-label':`Code editor: ${path}`}),EditorView.updateListener.of(update=>{if(update.docChanged)callback.current(update.state.doc.toString());})]})});
  view.current=editor;return()=>{editor.destroy();view.current=undefined;};
 },[path]);
 useEffect(()=>{const editor=view.current;if(editor&&editor.state.doc.toString()!==value)editor.dispatch({changes:{from:0,to:editor.state.doc.length,insert:value}});},[value]);
 return <div className="wb-code-editor" ref={host}/>;
}
