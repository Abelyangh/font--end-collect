/*
*  how to implement clipboard use pure javascript 
*  test on android
*  don't support ios device. 
*/

export default class Clipboard {
	constructor(document, window) {
       this.document = document;
       this.window = window;
       this.addEvents;
       this._intercept = false;
       this._data = null;
       this._boguSelection = false;
	}

    addEvents() {
    	this.document.addEventListener("copy", (e) => {
           if (this._intercept) {
              for (let key in this._data) {
                e.clipboardData.setData(key, this._data[key]);
              }
              e.preventDefault();
           }
    	});
    }

    copy(data) {
    	this._intercept = true;
    	if (typeof data === 'string') {
    		this._data = {'text/plain': data};
    	} else if (data instanceof Node) {
    		this._data = {'text/html': new XMLSerializer().serializeToString(data)};
    	} else {
    		this._data = data;
    	}
    	this._triggerCopy(false);
    }

    cleanup() {
    	this._intercept = false;
    	this._data = null;
    	if (this._boguSelection) {
    		this.window.getSelection().removeAllRanges();
    	}
    	this._boguSelection = false;
    }

    bogusSelect () {
    	const select = this.document.getSelection();
    	if (!this.document.queryCommandEnabled('copy') && select.isCollapsed) {
    		const range = this.document.createRange();
    		range.selectNodeContents(this.document.body);
    		select.removeAllRanges();
    		select.addRange(range);
    		this._boguSelection = true;

    	}
    }

    _triggerCopy(tryBogusSelect) {
    	try {
    		if (this.document.execCommand('copy')) {
    			this.cleanup();

    		} else {
    			if (!tryBogusSelect) {
    				this.bogusSelect();
    				this._triggerCopy(true);
    			} else {
    				this.cleanup();
    				throw new Error('unable to copy , your browser can\'t support copy command');
    			}
    		}
    	} catch (error){
            this.cleanup();
    	}
    }

}