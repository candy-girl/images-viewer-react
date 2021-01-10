import React, { forwardRef, memo } from 'react'
import classnames from 'classnames'
import ViewerCanvas from './ViewerCanvas'
import ViewerNav from './ViewerNav'
import ViewerToolbar, { defaultToolbars } from './ViewerToolbar'
import Icon, { ActionType } from './Icon'

import FAILED from './images/failed.png'

import * as constants from './constants'
import ViewerProps, { ImageDecorator, ToolbarConfig } from './ViewerProps'
import { ViewerRef } from './Viewer'

import './style/index.less'

const noop = () => ({})

const ACTION_TYPES = {
  setVisible: 'setVisible',
  setActiveIndex: 'setActiveIndex',
  update: 'update',
  clear: 'clear',
  setPDFLoading: 'setPDFLoading',
}

function createAction(type, payload) {
  return {
    type,
    payload: payload || {},
  }
}

export interface ViewerCoreState {
  visible?: boolean
  visibleStart?: boolean
  transitionEnd?: boolean
  activeIndex?: number
  width?: number
  height?: number
  top?: number
  left?: number
  rotate?: number
  imageWidth?: number
  imageHeight?: number
  scaleX?: number
  scaleY?: number
  loading?: boolean
  loadFailed?: boolean
  startLoading: boolean
  loadingPDF: boolean
}

const ViewerCore = (props: ViewerProps, viewerRef: React.MutableRefObject<ViewerRef>) => {
  const {
    visible = false,
    onClose = noop,
    images = [],
    navImgWidth = 100,
    activeIndex = 0,
    zIndex = 1000,
    drag = true,
    attribute = true,
    zoomable = true,
    rotatable = true,
    scalable = true,
    onMaskClick = noop,
    changeable = true,
    customToolbar = toolbars => toolbars,
    zoomSpeed = 0.05,
    disableKeyboardSupport = false,
    noResetZoomAfterChange = false,
    noLimitInitializationSize = false,
    defaultScale = 1,
    loop = true,
    // disableMouseZoom = false,
    downloadable = false,
    printable = false,
    noImgDetails = false,
    noToolbar = false,
    showTotal = true,
    minScale = 0.1,
  } = props

  const initialState: ViewerCoreState = {
    visible: false,
    visibleStart: false,
    transitionEnd: false,
    activeIndex: props.activeIndex,
    width: 0,
    height: 0,
    top: 10,
    left: null,
    rotate: 0,
    imageWidth: 0,
    imageHeight: 0,
    scaleX: defaultScale,
    scaleY: defaultScale,
    loading: false,
    loadFailed: false,
    startLoading: false,
    loadingPDF: false,
  }
  function setContainerWidthHeight() {
    let width = window.innerWidth
    let height = window.innerHeight
    if (props.container) {
      width = props.container.offsetWidth
      height = props.container.offsetHeight
    }
    return {
      width,
      height,
    }
  }
  const containerSize = React.useRef(setContainerWidthHeight())
  const footerHeight = constants.FOOTER_HEIGHT
  function reducer(s: ViewerCoreState, action): typeof initialState {
    switch (action.type) {
      case ACTION_TYPES.setVisible:
        return {
          ...s,
          visible: action.payload.visible,
        }
      case ACTION_TYPES.setActiveIndex:
        return {
          ...s,
          activeIndex: action.payload.index,
          startLoading: true,
        }
      case ACTION_TYPES.update:
        return {
          ...s,
          ...action.payload,
        }
      case ACTION_TYPES.clear:
        return {
          ...s,
          width: 0,
          height: 0,
          scaleX: defaultScale,
          scaleY: defaultScale,
          rotate: 1,
          imageWidth: 0,
          imageHeight: 0,
          loadFailed: false,
          top: 0,
          left: 0,
          loading: false,
        }
      case ACTION_TYPES.setPDFLoading:
        return {
          ...s,
          loadingPDF: action.payload,
        }
      default:
        break
    }
    return s
  }

  const viewerCore = React.useRef<HTMLDivElement>(null)
  const init = React.useRef(false)
  const currentLoadIndex = React.useRef(0)
  const [state, dispatch] = React.useReducer<(s: ViewerCoreState, a: unknown) => ViewerCoreState>(reducer, initialState)

  const printRef = viewerRef ? viewerRef : React.useRef(null)

  const setPDFLoading = (loading: boolean) => {
    dispatch({
      type: ACTION_TYPES.setPDFLoading,
      payload: loading,
    })
  }

  React.useEffect(() => {
    init.current = true

    return () => {
      init.current = false
    }
  }, [])

  React.useEffect(() => {
    containerSize.current = setContainerWidthHeight()
  }, [props.container])

  React.useEffect(() => {
    if (visible) {
      if (init.current) {
        dispatch(
          createAction(ACTION_TYPES.setVisible, {
            visible: true,
          }),
        )
      }
    }
  }, [visible])

  React.useEffect(() => {
    bindEvent()

    return () => {
      bindEvent(true)
    }
  })

  React.useEffect(() => {
    if (visible) {
      if (!props.container) {
        document.body.style.overflow = 'hidden'
        if (document.body.scrollHeight > document.body.clientHeight) {
          document.body.style.paddingRight = '15px'
        }
      }
    } else {
      dispatch(createAction(ACTION_TYPES.clear, {}))
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [state.visible])

  React.useEffect(() => {
    if (visible) {
      dispatch(
        createAction(ACTION_TYPES.setActiveIndex, {
          index: activeIndex,
        }),
      )
    }
  }, [activeIndex, visible, images])

  // 删除图片后重新加载
  React.useEffect(() => {
    if (images.length > 0) {
      loadImg(state.activeIndex)
    }
  }, [images.length])

  function loadImg(currentActiveIndex, isReset = false) {
    dispatch(
      createAction(ACTION_TYPES.update, {
        loading: true,
        loadFailed: false,
      }),
    )
    let activeImage: ImageDecorator = null
    if (images.length > 0) {
      activeImage = images[currentActiveIndex]
      if (activeImage.src.endsWith('.pdf')) {
        return setTimeout(() => {
          loadImgSuccess(containerSize.current.width, containerSize.current.height, true)
        }, 0)
      }
    }
    let loadComplete = false
    const img = new Image()
    img.onload = () => {
      if (!init.current) {
        return
      }
      if (!loadComplete) {
        if (img.src.includes(props.defaultImg.src)) {
          loadImgSuccess(img.width, img.height, false)
        } else {
          loadImgSuccess(img.width, img.height, true)
        }
      }
    }
    img.onerror = () => {
      if (!init.current) {
        return
      }
      if (props.defaultImg) {
        dispatch(
          createAction(ACTION_TYPES.update, {
            loading: false,
            loadFailed: true,
            startLoading: false,
          }),
        )
        img.src = props.defaultImg.src
      } else {
        dispatch(
          createAction(ACTION_TYPES.update, {
            loading: false,
            loadFailed: false,
            startLoading: false,
          }),
        )
      }
    }
    if (activeImage.src === 'changePdfFail') {
      img.src = FAILED
    } else {
      img.src = activeImage.src
    }
    if (img.complete) {
      loadComplete = true
      loadImgSuccess(img.width, img.height, true)
    }
    function loadImgSuccess(imgWidth, imgHeight, success) {
      if (currentActiveIndex !== currentLoadIndex.current) {
        return
      }
      let realImgWidth = imgWidth
      let realImgHeight = imgHeight
      if (props.defaultSize) {
        realImgWidth = props.defaultSize.width
        realImgHeight = props.defaultSize.height
      }
      if (activeImage.defaultSize) {
        realImgWidth = activeImage.defaultSize.width
        realImgHeight = activeImage.defaultSize.height
      }
      const [width, height] = getImgWidthHeight(realImgWidth, realImgHeight)
      const left = (containerSize.current.width - width) / 2
      const top = (containerSize.current.height - height - footerHeight - 60) / 2
      let scaleX = defaultScale
      let scaleY = defaultScale
      if (noResetZoomAfterChange && !isReset) {
        scaleX = state.scaleX
        scaleY = state.scaleY
      }
      dispatch(
        createAction(ACTION_TYPES.update, {
          width: width,
          height: height,
          left: left,
          top: top,
          imageWidth: imgWidth,
          imageHeight: imgHeight,
          loading: false,
          rotate: 0,
          scaleX: scaleX,
          scaleY: scaleY,
          loadFailed: !success,
          startLoading: false,
        }),
      )
    }
  }

  React.useEffect(() => {
    if (state.startLoading) {
      currentLoadIndex.current = state.activeIndex
      loadImg(state.activeIndex)
    }
  }, [state.startLoading, state.activeIndex])

  function getImgWidthHeight(imgWidth, imgHeight) {
    let width = 0
    let height = 0
    const maxWidth = containerSize.current.width * 0.8
    const maxHeight = (containerSize.current.height - footerHeight) * 0.8
    width = Math.min(maxWidth, imgWidth)
    height = (width / imgWidth) * imgHeight
    if (height > maxHeight) {
      height = maxHeight
      width = (height / imgHeight) * imgWidth
    }
    if (noLimitInitializationSize) {
      width = imgWidth
      height = imgHeight
    }
    return [width, height]
  }

  function handleChangeImg(newIndex: number) {
    if (!loop && (newIndex >= images.length || newIndex < 0)) {
      return
    }
    if (newIndex >= images.length) {
      newIndex = 0
    }
    if (newIndex < 0) {
      newIndex = images.length - 1
    }
    if (newIndex === state.activeIndex || state.loadingPDF) {
      return
    }
    if (props.onChange) {
      const activeImage = getActiveImage(newIndex)
      props.onChange(activeImage, newIndex)
    }
    dispatch(
      createAction(ACTION_TYPES.setActiveIndex, {
        index: newIndex,
      }),
    )
  }

  function getActiveImage(activeIndex2 = undefined) {
    let activeImg2: ImageDecorator = {
      navSrc: '',
      src: '',
      fileType: 'jpg',
      alt: '',
      downloadUrl: '',
    }

    let realActiveIndex = null
    if (activeIndex2 !== undefined) {
      realActiveIndex = activeIndex2
    } else {
      realActiveIndex = state.activeIndex
    }
    if (images.length > 0 && realActiveIndex >= 0) {
      activeImg2 = images[realActiveIndex]
    }

    return activeImg2
  }

  function handlePrint() {
    printRef.current?.toPrint()
  }

  function handleDownload() {
    const activeImage = getActiveImage()
    if (activeImage.downloadUrl) {
      if (props.downloadInNewWindow) {
        window.open(activeImage.downloadUrl, '_blank')
      } else {
        location.href = activeImage.downloadUrl
      }
    }
  }

  function handleScaleX(newScale: 1 | -1) {
    dispatch(
      createAction(ACTION_TYPES.update, {
        scaleX: state.scaleX * newScale,
      }),
    )
  }

  function handleScaleY(newScale: 1 | -1) {
    dispatch(
      createAction(ACTION_TYPES.update, {
        scaleY: state.scaleY * newScale,
      }),
    )
  }

  function handleRotate(isRight = false) {
    dispatch(
      createAction(ACTION_TYPES.update, {
        rotate: state.rotate + 90 * (isRight ? 1 : -1),
      }),
    )
  }

  function handleDefaultAction(type: ActionType) {
    const imgCenterXY = getImageCenterXY()
    const imgCenterXY2 = getImageCenterXY()
    switch (type) {
      case ActionType.prev:
        handleChangeImg(state.activeIndex - 1)
        break
      case ActionType.next:
        handleChangeImg(state.activeIndex + 1)
        break
      case ActionType.zoomIn:
        handleZoom(imgCenterXY.x, imgCenterXY.y, 1, zoomSpeed)
        break
      case ActionType.zoomOut:
        handleZoom(imgCenterXY2.x, imgCenterXY2.y, -1, zoomSpeed)
        break
      case ActionType.rotateLeft:
        handleRotate()
        break
      case ActionType.rotateRight:
        handleRotate(true)
        break
      case ActionType.reset:
        loadImg(state.activeIndex, true)
        break
      case ActionType.scaleX:
        handleScaleX(-1)
        break
      case ActionType.scaleY:
        handleScaleY(-1)
        break
      case ActionType.download:
        handleDownload()
        break
      case ActionType.print:
        handlePrint()
        break
      default:
        break
    }
  }

  function handleAction(config: ToolbarConfig) {
    handleDefaultAction(config.actionType)

    if (config.onClick) {
      const activeImage = getActiveImage()
      config.onClick(activeImage)
    }
  }

  function handleChangeImgState(width, height, top, left) {
    dispatch(
      createAction(ACTION_TYPES.update, {
        width: width,
        height: height,
        top: top,
        left: left,
      }),
    )
  }

  function handleResize() {
    containerSize.current = setContainerWidthHeight()
    if (visible) {
      const left = (containerSize.current.width - state.width) / 2
      const top = (containerSize.current.height - state.height - footerHeight) / 2
      dispatch(
        createAction(ACTION_TYPES.update, {
          left: left,
          top: top,
        }),
      )
    }
  }

  function handleCanvasMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    onMaskClick(e)
  }

  function bindEvent(remove = false) {
    // let funcName = 'addEventListener';
    if (remove) {
      // console.log(6666)
      // funcName = 'removeEventListener';
    }
    if (!disableKeyboardSupport) {
      // console.log(5555)
      // document[funcName]('keydown', handleKeydown, true);
    }
    if (viewerCore.current) {
      // console.log(4444)
      // viewerCore.current[funcName](
      //   'wheel',
      //   handleMouseScroll,
      //   false,
      // );
    }
  }

  function getImageCenterXY() {
    return {
      x: state.left + state.width / 2,
      y: state.top + state.height / 2,
    }
  }

  function handleZoom(targetX, targetY, direct, scale) {
    const imgCenterXY = getImageCenterXY()
    const diffX = targetX - imgCenterXY.x
    const diffY = targetY - imgCenterXY.y
    let top = 0
    let left = 0
    let width = 0
    let height = 0
    let scaleX = 0
    let scaleY = 0
    if (state.width === 0) {
      const [imgWidth, imgHeight] = getImgWidthHeight(state.imageWidth, state.imageHeight)
      left = (containerSize.current.width - imgWidth) / 2
      top = (containerSize.current.height - footerHeight - imgHeight) / 2
      width = state.width + imgWidth
      height = state.height + imgHeight
      scaleX = scaleY = 1
    } else {
      const directX = state.scaleX > 0 ? 1 : -1
      const directY = state.scaleY > 0 ? 1 : -1
      scaleX = state.scaleX + scale * direct * directX
      scaleY = state.scaleY + scale * direct * directY
      if (typeof props.maxScale !== 'undefined') {
        if (Math.abs(scaleX) > props.maxScale) {
          scaleX = props.maxScale * directX
        }
        if (Math.abs(scaleY) > props.maxScale) {
          scaleY = props.maxScale * directY
        }
      }
      if (Math.abs(scaleX) < minScale) {
        scaleX = minScale * directX
      }
      if (Math.abs(scaleY) < minScale) {
        scaleY = minScale * directY
      }
      top = state.top + ((-direct * diffY) / state.scaleX) * scale * directX
      left = state.left + ((-direct * diffX) / state.scaleY) * scale * directY
      width = state.width
      height = state.height
    }
    dispatch(
      createAction(ACTION_TYPES.update, {
        width: width,
        scaleX: scaleX,
        scaleY: scaleY,
        height: height,
        top: top,
        left: left,
        loading: false,
      }),
    )
  }

  const prefixCls = 'images-viewer-react'

  const className = classnames(`${prefixCls}`, `${prefixCls}-transition`, {
    [`${prefixCls}-inline`]: props.container,
    [props.className]: props.className,
  })

  const viewerStryle: React.CSSProperties = {
    opacity: visible && state.visible ? 1 : 0,
    display: visible || state.visible ? 'block' : 'none',
  }

  let activeImg: ImageDecorator = {
    navSrc: '',
    src: '',
    fileType: 'jpg',
    alt: '',
  }

  if (visible && state.visible && !state.loading && state.activeIndex !== null && !state.startLoading) {
    activeImg = getActiveImage()
  }

  return (
    <div
      className={className}
      style={viewerStryle}
      onTransitionEnd={() => {
        if (!visible) {
          dispatch(
            createAction(ACTION_TYPES.setVisible, {
              visible: false,
            }),
          )
        }
      }}
      ref={viewerCore}
    >
      <div className={`${prefixCls}-mask`} style={{ zIndex: zIndex }} />
      {props.noClose || (
        <div
          className={`${prefixCls}-close ${prefixCls}-btn`}
          onClick={() => {
            onClose()
          }}
          style={{ zIndex: zIndex + 10 }}
        >
          <Icon type={ActionType.close} />
        </div>
      )}
      <ViewerCanvas
        ref={printRef}
        prefixCls={prefixCls}
        imgSrc={
          state.loadFailed && !activeImg.src.endsWith('.pdf') ? props.defaultImg.src || activeImg.src : activeImg.src
        }
        visible={visible}
        width={state.width}
        height={state.height}
        top={state.top}
        left={state.left}
        rotate={state.rotate}
        onChangeImgState={handleChangeImgState}
        onResize={handleResize}
        zIndex={zIndex + 5}
        scaleX={state.scaleX}
        scaleY={state.scaleY}
        loading={state.loading}
        drag={drag}
        container={props.container}
        setPDFLoading={setPDFLoading}
        onCanvasMouseDown={handleCanvasMouseDown}
      />
      {props.noFooter || (
        <div className={`${prefixCls}-footer`} style={{ zIndex: zIndex + 5 }}>
          {noToolbar || (
            <ViewerToolbar
              prefixCls={prefixCls}
              onAction={handleAction}
              alt={activeImg.alt}
              width={state.imageWidth}
              height={state.imageHeight}
              attribute={attribute}
              zoomable={zoomable}
              rotatable={rotatable}
              scalable={scalable}
              changeable={changeable}
              downloadable={downloadable}
              printable={printable}
              noImgDetails={noImgDetails}
              toolbars={customToolbar(defaultToolbars)}
              activeIndex={state.activeIndex}
              count={images.length}
              showTotal={showTotal}
              loadingPDF={state.loadingPDF}
            />
          )}
          {props.noNavbar || (
            <ViewerNav
              prefixCls={prefixCls}
              images={props.images}
              activeIndex={state.activeIndex}
              onChangeImg={handleChangeImg}
              onPreButton={props.onPreButton}
              onNextButton={props.onNextButton}
              navImgWidth={navImgWidth}
              loadingPDF={state.loadingPDF}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default memo(forwardRef<ViewerRef, ViewerProps>(ViewerCore))
