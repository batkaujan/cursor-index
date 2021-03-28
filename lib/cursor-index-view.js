'use babel';
import { CompositeDisposable, Disposable } from 'atom';
import GotoIndexView from './goto-index-view';
export default class CursorIndexView {
  constructor(statusBar = null) {
    this.tile = null;
    this.element = null;
    this.subscriptions = null;
    this.subscriptionCurPos = null;
    this.gotoIndexView = null;
    this.miniEditor = null;
    this.subscriptionClick = null;
    this.drawUI(statusBar);
  }
  drawUI(statusBar = null){
    if (statusBar && this.tile === null) {
      //When nothing is drawn AND the statusBar is ready, this line is reached and start to draw.
      //If the statusBar is not ready OR this is already drawn, this line won't be reached.
      //Null/non-null state of this.tile is same as this.element, this.subscriptions, this.subscriptionCurPos,
      //this.gotoIndexView, this.miniEditor, this.subscriptionClick,
      //thus checking this.tile is enough for whether drawn.

      //Draw the element to the statusBar
      this.element = document.createElement('cursor-index');
      this.element.classList.add('cursor-index'); //This string is same as the package name for searching convenience
      this.element.classList.add('inline-block');  //This line is a must in order to show the this.element
      this.element.textContent = '';  //Empty string is used (but not shown) for non text editor at the beginning
      this.tile = statusBar.addLeftTile({ item: this.element, priority: 10 }); //10 instead of 1 for future packages

      //Define how to update the cursor index text in the this.element
      let activePaneItem = null;  //No need to destroy activePaneItem on Atom Exit, so put it here rather than member.
      let getCurIdx = ()=>{
        if (activePaneItem) {
          let curPos = activePaneItem.getCursorBufferPosition();  //Zero-based Cursor Position (row, col)
          let curIdx = activePaneItem.getBuffer().characterIndexForPosition(curPos); //Zero-based Cursor Index (index)
          return (atom.config.get('cursor-index.zeroBased') ? 0 : 1) + curIdx;
        }
        return -1;
      };
      let setCurMsg = ()=>{ //Empty string is used (but not shown) for non text editor during any update
        let curIdx = getCurIdx();
        this.element.textContent = (curIdx >= 0 ? `[${curIdx}]` : '');
      };

      //Subscriptions
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(atom.workspace.observeActivePaneItem((paneItem)=>{//observe is triggered when Atom's ready
        if (paneItem && (paneItem.constructor.name === 'TextEditor')) {
          if (paneItem !== activePaneItem) {
            activePaneItem = paneItem;
            setCurMsg();  //Update (Also the 1st time update to replace the empty after the this.element is born)
            this.destroySubscriptionCurPos();
            this.subscriptionCurPos = activePaneItem.onDidChangeCursorPosition(()=>{ setCurMsg(); });
            this.element.classList.remove('hide');  this.element.style.display = ''; //Using two methods to show
          }
        }
        else {
          activePaneItem = null;
          setCurMsg();
          this.destroySubscriptionCurPos();
          this.element.classList.add('hide'); this.element.style.display = 'none'; //Using two methods to hide
        }
      }));
      this.subscriptions.add(atom.config.onDidChange('cursor-index.zeroBased', ()=>{ setCurMsg(); }));

      //Tooltips
      const getZeroOrOneTagU = ()=>{ return atom.config.get('cursor-index.zeroBased') ? 'Zero-based' : 'One-based'; };
      this.subscriptions.add(
        atom.tooltips.add(this.element, { title: ()=>`${getZeroOrOneTagU()} cursor index ${getCurIdx()}` })
      );

      //The GotoIndexView on click
      this.gotoIndexView = new GotoIndexView();
      let clickHandler = ()=>{  //Last time I used 'this.gotoIndexView.toggle();' instead of the following line
        atom.commands.dispatch(atom.views.getView(atom.workspace.getActiveTextEditor()), 'cursor-index:goto-index');
      }
      this.element.addEventListener('click', clickHandler);
      this.subscriptionClick = new Disposable(()=>{ this.element.removeEventListener('click', clickHandler); });
    }
  }
  destroySubscriptionCurPos() {
    if (this.subscriptionCurPos) { this.subscriptionCurPos.dispose(); this.subscriptionCurPos = null; }
  }
  destroy() {
    if (this.subscriptionClick) { this.subscriptionClick.dispose(); this.subscriptionClick = null; }
    if (this.miniEditor) { this.miniEditor.destroy(); this.miniEditor = null; }
    if (this.gotoIndexView) { this.gotoIndexView.destroy(); this.gotoIndexView = null; }
    this.destroySubscriptionCurPos();
    if (this.subscriptions) { this.subscriptions.dispose(); this.subscriptions = null; }
    if (this.element) { this.element.remove(); this.element = null; }
    if (this.tile) { this.tile.destroy(); this.tile = null; }
  }
}
