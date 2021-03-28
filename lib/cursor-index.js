'use babel';
import { CompositeDisposable } from 'atom';
import CursorIndexView from './cursor-index-view';
export default {
  //Member variables sorted in derivation sequence
  subscriptions: null,
  cursorIndexView: null,
  statusBar: null,

  //The config that can be found at File -> Settings -> Packages -> cursor-index
  config: {
    toggle: { type: 'boolean', title: 'Toggle', default: true, order: 1 },
    zeroBased: { type: 'boolean', title: 'Zero-based index', default: true, order: 2 }
  },

  //Member functions sorted in life sequence
  activate() {  //The state parameter is omitted because the function serialize is not needed
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.config.onDidChange('cursor-index.toggle', (pair)=>{ this.toggle(pair.newValue); }));
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'cursor-index:toggle': ()=>{
      atom.config.set('cursor-index.toggle', !this.isToggled()); //This line trigger atom.config.onDidChange
    }})); //Menu can trigger this line
  },
  consumeStatusBar(statusBar) {
    this.statusBar = statusBar; //Every call to this.toggle is meaningful only after this.statusBar is set
    this.toggle(this.isToggled());
  },
  isToggled() { return atom.config.get('cursor-index.toggle'); },
  toggle(boolVal = !this.isToggled()) {  //Make sure this.cursorIndexView is instantiated iff boolValue is true
    if (boolVal !== (this.cursorIndexView !== null)) {
      if (this.cursorIndexView) { this.cursorIndexView.destroy(); this.cursorIndexView = null; }
      else { this.cursorIndexView = new CursorIndexView(this.statusBar); }  //this.statusBar may be null here
    } //this.statusBar is null if this.toggle is called before consumeStatusBar
    else if (boolVal) { this.cursorIndexView.drawUI(this.statusBar); }  //In case new CursorIndexView(null) is called
  },
  deactivate() {
    this.subscriptions.dispose();
    this.toggle(false);
  }
};
