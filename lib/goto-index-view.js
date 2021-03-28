'use babel';
import { CompositeDisposable, TextEditor } from 'atom';
export default class GotoIndexView {
  constructor() {
    this.miniEditor = new TextEditor({ mini: true });
    this.miniEditor.element.addEventListener('blur', this.close.bind(this));
    this.message = document.createElement('div');
    this.message.classList.add('message');
    this.element = document.createElement('div');
    this.element.appendChild(this.miniEditor.element);
    this.element.appendChild(this.message);
    this.panel = atom.workspace.addModalPanel({ item: this, visible: false });
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'cursor-index:goto-index': ()=>{ this.toggle(); } }));
    this.subscriptions.add(atom.commands.add(this.miniEditor.element, 'core:confirm', () => { this.navigate(); }));
    this.subscriptions.add(atom.commands.add(this.miniEditor.element, 'core:cancel', () => { this.close(); }));
    this.miniEditor.onWillInsertText(arg => { if (arg.text.match(/[^0-9:]/)) { arg.cancel(); } });
    this.miniEditor.onDidChange(() => { this.navigate({ keepOpen: true }); });
    this.previouslyFocusedElement = null;
  }
  toggle() { this.panel.isVisible() ? this.close() : this.open(); }
  close() {
    if (this.panel.isVisible()) {
      this.panel.hide();
      if (this.miniEditor.element.hasFocus()) { this.restoreFocus(); }
    }
  }
  navigate(options = {}) {
    const lineNumber = this.miniEditor.getText();
    const editor = atom.workspace.getActiveTextEditor();
    if (!options.keepOpen) { this.close(); }
    if (editor && lineNumber.length) {
      let curIdx = parseInt(this.miniEditor.getText());
      if (!atom.config.get('cursor-index.zeroBased')) { curIdx = Math.max(0, curIdx - 1); }
      let curPos = editor.getBuffer().positionForCharacterIndex(curIdx);
      editor.setCursorBufferPosition(curPos);
      editor.unfoldBufferRow(curPos.row);
      if (curPos.column < 0) { editor.moveToFirstCharacterOfLine(); }
      editor.scrollToBufferPosition(curPos, { center: true });
    }
  }
  storeFocusedElement() {
    this.previouslyFocusedElement = document.activeElement;
    return this.previouslyFocusedElement;
  }
  restoreFocus() {
    if (this.previouslyFocusedElement && this.previouslyFocusedElement.parentElement) {
      return this.previouslyFocusedElement.focus();
    }
    atom.views.getView(atom.workspace).focus();
  }
  open() {
    if (!this.panel.isVisible() && atom.workspace.getActiveTextEditor()) {
      this.storeFocusedElement();
      this.panel.show();
      const getZeroOrOneTagL = ()=>{ return atom.config.get('cursor-index.zeroBased') ? 'zero-based' : 'one-based'; };
      this.message.textContent = `\
      Enter a ${getZeroOrOneTagL()} <index> to go there. \
      Examples: "27" for ${getZeroOrOneTagL()} cursor index 27`;
      this.miniEditor.setText('');
      this.miniEditor.element.focus();
    }
  }
  destroy() {
    this.subscriptions.dispose();
    this.miniEditor.destroy();
    this.element.remove();
    this.panel.destroy();
  }
}
//The above code is modified from https://github.com/atom/go-to-line/blob/master/lib/go-to-line-view.js on May 27, 2021
//At that time the last commit was 973e003 on Jan 26, 2018
