import baseComponent from '../helpers/baseComponent'
import classNames from '../helpers/classNames'

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1

const toNumberWhenUserInput = (num) => {
    if (/\.\d*0$/.test(num) || num.length > 16) {
        return num
    }

    if (isNaN(num)) {
        return num
    }

    return Number(num)
}

const getValidValue = (value, min, max) => {
    let val = parseFloat(value)

    if (isNaN(val)) {
        return value
    }

    if (val < min) {
        val = min
    }

    if (val > max) {
        val = max
    }

    return val
}

baseComponent({
    externalClasses: ['wux-sub-class', 'wux-input-class', 'wux-add-class'],
    properties: {
        prefixCls: {
            type: String,
            value: 'wux-input-number',
        },
        shape: {
            type: String,
            value: 'square',
        },
        min: {
            type: Number,
            value: -MAX_SAFE_INTEGER,
        },
        max: {
            type: Number,
            value: MAX_SAFE_INTEGER,
        },
        step: {
            type: Number,
            value: 1,
        },
        defaultValue: {
            type: Number,
            value: 0,
        },
        value: {
            type: Number,
            value: 0,
            observer(newVal) {
                if (this.data.controlled) {
                    this.updated(newVal)
                }
            },
        },
        disabled: {
            type: Boolean,
            value: true,
        },
        longpress: {
            type: Boolean,
            value: false,
        },
        color: {
            type: String,
            value: 'balanced',
        },
        controlled: {
            type: Boolean,
            value: false,
        },
    },
    data: {
        inputValue: 0,
        disabledMin: false,
        disabledMax: false,
    },
    computed: {
        classes() {
            const { prefixCls, shape, color, disabledMin, disabledMax } = this.data
            const wrap = classNames(prefixCls, {
                [`${prefixCls}--${shape}`]: shape,
            })
            const sub = classNames(`${prefixCls}__selector`, {
                [`${prefixCls}__selector--sub`]: true,
                [`${prefixCls}__selector--${color}`]: color,
                [`${prefixCls}__selector--disabled`]: disabledMin,
            })
            const add = classNames(`${prefixCls}__selector`, {
                [`${prefixCls}__selector--add`]: true,
                [`${prefixCls}__selector--${color}`]: color,
                [`${prefixCls}__selector--disabled`]: disabledMax,
            })
            const icon = `${prefixCls}__icon`
            const input = `${prefixCls}__input`

            return {
                wrap,
                sub,
                add,
                icon,
                input,
            }
        },
    },
    methods: {
        /**
         * ?????????
         */
        updated(value, condition = true, trigger = false) {
            const { min, max } = this.data
            const inputValue = getValidValue(value, min, max)
            const disabledMin = inputValue <= min
            const disabledMax = inputValue >= max

            // ????????????????????????????????????????????? sub ??? add ??????
            if (condition) {
                this.setData({
                    inputValue,
                    disabledMin,
                    disabledMax,
                })
            }

            // ????????????
            if (trigger) {
                this.triggerEvent('change', { value: inputValue })
            }
        },
        /**
         * ??????????????????
         */
        calculation(type, meta) {
            const { disabledMax, disabledMin, inputValue, step, longpress, controlled } = this.data

            // add
            if (type === 'add') {
                if (disabledMax) return false
                this.updated(inputValue + step, !controlled, true)
            }

            // sub
            if (type === 'sub') {
                if (disabledMin) return false
                this.updated(inputValue - step, !controlled, true)
            }

            // longpress
            if (longpress && meta) {
                this.timeout = setTimeout(() => this.calculation(type, meta), 100)
            }
        },
        /**
         * ??????????????????????????? input ??????
         */
        onInput(e) {
            this.clearInputTimer()
            this.inputTime = setTimeout(() => {
                const value = toNumberWhenUserInput(e.detail.value)
                this.updated(value, !this.data.controlled)
                this.triggerEvent('change', { value })
            }, 300)
        },
        /**
         * ????????????????????????
         */
        onFocus(e) {
            this.triggerEvent('focus', e.detail)
        },
        /**
         * ??????????????????????????????
         */
        onBlur(e) {
            // always set input value same as value
            this.setData({
                inputValue: this.data.inputValue,
            })

            this.triggerEvent('blur', e.detail)
        },
        /**
         * ????????????????????????350ms?????????
         */
        onLongpress(e) {
            const { type } = e.currentTarget.dataset
            const { longpress } = this.data
            if (longpress) {
                this.calculation(type, true)
            }
        },
        /**
         * ???????????????????????????
         */
        onTap(e) {
            const { type } = e.currentTarget.dataset
            const { longpress } = this.data
            if (!longpress || longpress && !this.timeout) {
                this.calculation(type, false)
            }
        },
        /**
         * 	????????????????????????
         */
        onTouchEnd() {
            this.clearTimer()
        },
        /**
         * ??????????????????????????????????????????????????????
         */
        onTouchCancel() {
            this.clearTimer()
        },
        /**
         * ????????????????????????
         */
        clearTimer() {
            if (this.timeout) {
                clearTimeout(this.timeout)
                this.timeout = null
            }
        },
        /**
         * ???????????????????????????
         */
        clearInputTimer() {
            if (this.inputTime) {
                clearTimeout(this.inputTime)
                this.inputTime = null
            }
        },
    },
    attached() {
        const { defaultValue, value, controlled } = this.data
        const inputValue = controlled ? value : defaultValue

        this.updated(inputValue)
    },
    detached() {
        this.clearTimer()
        this.clearInputTimer()
    },
})