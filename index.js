class YPromise {
    constructor(exector) {
        this.value = null;
        this.status = YPromise.PENDING;
        this.initBind();
        this.init(exector);
    }

    initBind() {
        this.resolve = this.resolve.bind(this);
        this.reject = this.reject.bind(this);
    }

    init(exector) {
        if (typeof exector !== 'function') {
            throw new TypeError('an argument must be function');
        }
        exector(this.resolve, this.reject);
    }

    resolve() {

    }

    reject() {

    }
}

/**
 * 定义YPromise几个状态
 */
YPromise.PENDING = 'pending';
YPromise.FULFILLED = 'fulfilled';
YPromise.REJECTED = 'rejected';