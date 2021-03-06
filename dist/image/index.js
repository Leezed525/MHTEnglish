import baseComponent from '../helpers/baseComponent'
import classNames from '../helpers/classNames'

const EMPTY = 'empty'
const LOADING = 'loading'
const LOADED = 'loaded'
const ERROR = 'error'
const UNMOUNTED = 'unmounted'

const calcStyle = (value) => typeof value === 'number' ? `${value}px` : value

baseComponent({
    properties: {
        prefixCls: {
            type: String,
            value: 'wux-image',
        },
        src: {
            type: String,
            value: '',
            observer: 'updated',
        },
        mode: {
            type: String,
            value: 'scaleToFill',
        },
        lazyLoad: {
            type: Boolean,
            value: false,
        },
        shape: {
            type: String,
            value: 'normal',
        },
        width: {
            type: null,
            value: 300,
            observer: 'updateStyle',
        },
        height: {
            type: null,
            value: 225,
            observer: 'updateStyle',
        },
        unmountOnEmpty: {
            type: Boolean,
            value: false,
        },
        unmountOnError: {
            type: Boolean,
            value: false,
        },
        empty: {
            type: String,
            value: '',
        },
        loading: {
            type: String,
            value: '',
        },
        error: {
            type: String,
            value: '',
        },
    },
    data: {
        status: '',
    },
    computed: {
        classes() {
            const { prefixCls, shape, mode, status, empty, loading, error } = this.data
            const wrap = classNames(prefixCls, {
                [`${prefixCls}--${shape}`]: shape,
                [`${prefixCls}--${mode}`]: mode,
                [`${prefixCls}--${status}`]: status,
            })
            const inner = `${prefixCls}__inner`
            const thumb = `${prefixCls}__thumb`
            const mask = classNames(`${prefixCls}__mask`, {
                [`${prefixCls}__mask--text`]: empty || loading || error,
            })
            const text = `${prefixCls}__text`

            return {
                wrap,
                inner,
                thumb,
                mask,
                text,
            }
        },
    },
    methods: {
        /** 
         * ??????????????????
         */
        updated(src = this.data.src) {
            this.updateStatus(!!src ? LOADING : this.data.unmountOnEmpty ? UNMOUNTED : EMPTY)
        },
        /**
         * ??????????????????
         */
        updateStyle(opts = {}) {
            const { width, height } = Object.assign({}, this.data, opts)
            const style = `width: ${calcStyle(width)}; height: ${calcStyle(height)}`
            
            this.setData({
                style,
            })
        },
        /**
         * ??????????????????
         */
        updateStatus(status) {
            if (this.data.status !== status) {
                this.setData({
                    status,
                })
            }

            this.triggerEvent('change', { status })
        },
        /**
         * ????????????????????????????????????
         */
        onLoad(e) {
            this.updateStatus(LOADED)
            this.triggerEvent('load', { ...e.detail, status: LOADED })
        },
        /**
         * ????????????????????????????????????
         */
        onError(e) {
            const status = this.data.unmountOnError ? UNMOUNTED : ERROR
            this.updateStatus(status)
            this.triggerEvent('error', { ...e.detail, status })
        },
        /**
         * ????????????
         */
        onTap(e) {
            this.triggerEvent('click', { ...e.detail, status: this.data.status })
        },
    },
    attached() {
        this.updateStyle()
        this.updated()
    },
})