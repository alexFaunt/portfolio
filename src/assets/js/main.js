(function (window) {
    'use strict';

    const APP_NAME = 'portfolio';

    const EVENTS = {
        CLICK: 'click',
        SCROLL: 'scroll'
    };

    /************
        Store
    *************/

    class Store {
        constructor (win) {
            this.store = win.localStorage;
            this.queue = {};
            this.data = null;
            this.timeout = null;
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

            if (this.timeout !== null) {
                window.clearTimeout(this.timeout);
            }

            this.timeout = window.setTimeout(function () {
                this.timeout = null;
                this.flush();
            }.bind(this), 1000);
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
        VISIT_3: 'visit-3',
        STAY_1: 'stay-1',
        STAY_2: 'stay-2',
        STAY_3: 'stay-3',
        TRIGGER: 'trigger',
        EMAIL: 'email',
        BUSINESS: 'business',
        CARTOGRAPHER: 'cartographer',
        HOBBIT: 'hobbit'
    };

    const CHEEV_STATUS = {
        INCOMPLETE: 0,
        COMPLETE: 1
    };

    const cheevs = {};

    class Cheev {
        constructor (id, criteria) {
            this.id = id;
            this.el = document.getElementById(id);
            this.data = store.get(id);

            if (this.data === null) {
                this.data = {
                    status: CHEEV_STATUS.INCOMPLETE,
                    criteria: criteria,
                    progress: this.getDefaultProgress()
                };
            }

            // Was already complete
            if (this.data.status === CHEEV_STATUS.COMPLETE) {
                this.showComplete();
                return true;
            }

            if (this.check()) {
                return true;
            }

            this.monitor();
            return false;
        }

        // Toast to do
        // Need a toast container.
        toast () {}

        showComplete () {
            this.el.classList.add('enabled');
        }

        complete () {
            this.data.status = CHEEV_STATUS.COMPLETE;
            this.showComplete();
            this.toast();
            this.end();
        }

        save () {
            // store it.
            store.set(this.id, this.data);
        }

        end () {
            this.stopMonitor();
            this.save();
        }

        getDefaultProgress () {
            return 0;
        }

        // Abstract
        check () {}
        monitor () {}
        stopMonitor () {}

    }

    /**
     * Counts the amount of visits
     */
    class VisitCheev extends Cheev {

        check () {
            this.data.progress += 1;

            // If you've just hit the target!
            if (this.data.progress >= this.data.criteria) {
                this.complete();
            }
            // store it and stop doing anything else.
            else {
                this.end();
            }
        }
    }

    cheevs[CHEEV_IDS.VISIT_1] = new VisitCheev(CHEEV_IDS.VISIT_1, 1);
    cheevs[CHEEV_IDS.VISIT_2] = new VisitCheev(CHEEV_IDS.VISIT_2, 3);
    cheevs[CHEEV_IDS.VISIT_3] = new VisitCheev(CHEEV_IDS.VISIT_3, 10);

    /**
     * Counts the amount of visits
     */
    class TimeCheev extends Cheev {

        monitor () {
            this.timeoutId = window.setTimeout(this.complete.bind(this), this.data.criteria);
        }

        stopMonitor () {
            window.clearTimeout(this.timeoutId);
        }
    }

    cheevs[CHEEV_IDS.STAY_1] = new TimeCheev(CHEEV_IDS.STAY_1, 1000 * 60);
    cheevs[CHEEV_IDS.STAY_2] = new TimeCheev(CHEEV_IDS.STAY_2, 1000 * 60 * 15);
    cheevs[CHEEV_IDS.STAY_3] = new TimeCheev(CHEEV_IDS.STAY_3, 1000 * 60 * 60);


    /**
     * Counts the amount of visits
     */
    class ClickCheev extends Cheev {

        onClick () {
            this.data.progress += 1;
            this.check();
        }

        check () {
            if (this.data.progress >= this.data.criteria.count) {
                this.complete();
            }
        }

        monitor () {
            for (let i = 0; i < this.data.criteria.targets.length; i += 1) {
                this.data.criteria.targets[i].addEventListener(EVENTS.CLICK, this.onClick.bind(this));
            }
        }

        stopMonitor () {
            for (let i = 0; i < this.data.criteria.targets.length; i += 1) {
                this.data.criteria.targets[i].removeEventListener(EVENTS.CLICK, this.onClick.bind(this));
            }
        }
    }

    cheevs[CHEEV_IDS.TRIGGER] = new ClickCheev(CHEEV_IDS.TRIGGER, {
        count: 100,
        targets: [document]
    });

    cheevs[CHEEV_IDS.EMAIL] = new ClickCheev(CHEEV_IDS.EMAIL, {
        count: 1,
        targets: document.querySelectorAll('[data-cheev-click*="' + CHEEV_IDS.EMAIL + '"]')
    });

    cheevs[CHEEV_IDS.BUSINESS] = new ClickCheev(CHEEV_IDS.BUSINESS, {
        count: 1,
        targets: document.querySelectorAll('[data-cheev-click*="' + CHEEV_IDS.BUSINESS + '"]')
    });


    /**
     * Counts the amount of visits
     */
    class ScrollCheev extends Cheev {

        getDefaultProgress () {
            return {
                top: 0,
                bottom: 0
            };
        }

        onScrollEnd () {
            this.timeoutId = null;
            this.check();
            this.save();
        }

        onScroll () {
            if (this.timeoutId !== null) {
                window.clearTimeout(this.timeoutId);
            }
            this.timeoutId = window.setTimeout(this.onScrollEnd.bind(this), 50);
        }

        check () {

            if (!window.scrollY) {
                this.data.progress.top += 1;
            }

            if (window.document.body.clientHeight === window.screen.height + window.scrollY) {
                this.data.progress.bottom += 1;
            }

            if (this.data.progress.top >= this.data.criteria.top &&
                this.data.progress.bottom >= this.data.criteria.bottom) {
                this.complete();
            }
        }

        monitor () {
            this.eventListener = this.onScroll.bind(this);
            window.addEventListener(EVENTS.SCROLL, this.eventListener);
        }

        stopMonitor () {
            window.removeEventListener(EVENTS.SCROLL, this.eventListener);
        }
    }

    cheevs[CHEEV_IDS.CARTOGRAPHER] = new ScrollCheev(CHEEV_IDS.CARTOGRAPHER, {
        top: 1,
        bottom: 1
    });

    cheevs[CHEEV_IDS.HOBBIT] = new ScrollCheev(CHEEV_IDS.HOBBIT, {
        top: 2,
        bottom: 1
    });




    // Save to storage.
    store.flush();


})(window);