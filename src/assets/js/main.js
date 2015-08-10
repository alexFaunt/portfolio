(function (window) {
    'use strict';

    const APP_NAME = 'portfolio';

    /************
        Store
    *************/

    class Store {
        constructor (win) {
            this.store = win.localStorage;
            this.queue = {};
            this.data = null;
        }

        get (id) {
            // If we haven't got the data yet - get it from storage.
            if (this.data === null) {
                const data = this.store.getItem(APP_NAME);

                // What did we get from storage
                if (data) {
                    // parse it if it exists
                    this.data = JSON.parse(data);
                }
                else {
                    // create it if it doesnt
                    this.data = {};
                }
            }

            // Return data if it exists or a blank object if it doesn't
            return this.data[id] || null;
        }

        set (id, data) {
            this.data[id] = data;
        }

        flush () {
            this.store.setItem(APP_NAME, JSON.stringify(this.data));
        }
    }

    const store = new Store(window);



    /************
        Cheevs
    *************/

    const CHEEV_IDS = {
        VISIT_1: 'visit-1',
        VISIT_2: 'visit-2',
        VISIT_3: 'visit-3'
    };

    const CHEEV_STATUS = {
        INCOMPLETE: 0,
        COMPLETE: 1
    };

    const cheevs = {};

    class Cheev {
        constructor (id) {
            this.id = id;
            this.el = document.getElementById(id);
            this.data = store.get(id);

            if (this.data === null) {
                this.data = {
                    status: CHEEV_STATUS.INCOMPLETE,
                    criteria: null
                };
            }
        }

        // Toast to do
        // Need a toast container.
        toast () {}

        enable () {
            this.el.classList.add('enabled');
        }

        complete () {
            console.log('COMPLETE', this.data.criteria);
            this.data.status = CHEEV_STATUS.COMPLETE;
            this.enable();
            this.toast();
        }

        check () {
            if (this.data.status === CHEEV_STATUS.COMPLETE) {
                this.enable();
                return true;
            }
            return false;
        }

    }

    class VisitCheev extends Cheev {

        constructor (id, target) {
            super(id);
            this.target = target;
        }

        check () {
            // Call super and if it's handled - return
            if (super.check()) {
                return;
            }

            // This set up current value
            if (this.data.criteria === null) {
                 this.data.criteria = 1;
            }
            else {
                 this.data.criteria++;
            }

            // If you've just hit the target!
            if (this.data.criteria === this.target) {
                this.complete();
            }

            // store it.
            store.set(this.id, this.data);

            return this;
        }
    }

    cheevs[CHEEV_IDS.VISIT_1] = new VisitCheev(CHEEV_IDS.VISIT_1, 1).check();
    cheevs[CHEEV_IDS.VISIT_2] = new VisitCheev(CHEEV_IDS.VISIT_2, 3).check();
    cheevs[CHEEV_IDS.VISIT_3] = new VisitCheev(CHEEV_IDS.VISIT_3, 10).check();

    // Save to storage.
    store.flush();





})(window);