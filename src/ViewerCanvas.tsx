import React, { forwardRef, memo } from 'react'
import classnames from 'classnames'
import { useReactToPrint } from 'react-to-print'
import { Document, Page, pdfjs } from 'react-pdf'
import Loading from './Loading'

import FAILED from './images/failed.png'
import { ViewerRef } from './Viewer'
import PdfjsWorker from './pdf.worker.entry'
import 'react-pdf/dist/umd/Page/AnnotationLayer.css'

pdfjs.GlobalWorkerOptions.workerPort = new PdfjsWorker()

export interface PrintRef {
  toPrint: () => void
}

const pageSize = 5
const printSize = 5

const options = {
  // cMapUrl: 'cmaps/',
  cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
}

export interface ViewerCanvasProps {
  prefixCls: string
  imgSrc: string
  visible: boolean
  width: number
  height: number
  top: number
  left: number
  rotate: number
  onChangeImgState: (width: number, height: number, top: number, left: number) => void
  onResize: () => void
  zIndex: number
  scaleX: number
  scaleY: number
  loading: boolean
  drag: boolean
  container: HTMLElement
  setPDFLoading: (loading: boolean) => void
  onCanvasMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void
}

export interface ViewerCanvasState {
  isMouseDown?: boolean
  mouseX?: number
  mouseY?: number
}

const ViewerCanvas = (props: ViewerCanvasProps, printRef) => {
  const isMouseDown = React.useRef(false)
  const prePosition = React.useRef({
    x: 0,
    y: 0,
  })
  const [position, setPosition] = React.useState({
    x: 0,
    y: 0,
  })

  React.useEffect(() => {
    return () => {
      bindEvent(true)
      bindWindowResizeEvent(true)
    }
  }, [])

  React.useEffect(() => {
    bindWindowResizeEvent()

    return () => {
      bindWindowResizeEvent(true)
    }
  })

  React.useEffect(() => {
    if (props.visible && props.drag) {
      bindEvent()
    }
    if (!props.visible && props.drag) {
      handleMouseUp()
    }
    return () => {
      bindEvent(true)
    }
  }, [props.drag, props.visible])

  React.useEffect(() => {
    const diffX = position.x - prePosition.current.x
    const diffY = position.y - prePosition.current.y
    prePosition.current = {
      x: position.x,
      y: position.y,
    }
    props.onChangeImgState(props.width, props.height, props.top + diffY, props.left + diffX)
  }, [position])

  function handleResize() {
    props.onResize()
  }

  function handleCanvasMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    props.onCanvasMouseDown(e)
    handleMouseDown(e)
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) {
      return
    }
    if (!props.visible || !props.drag) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    isMouseDown.current = true
    prePosition.current = {
      x: e.nativeEvent.clientX,
      y: e.nativeEvent.clientY,
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMouseDown.current) {
      setPosition({
        x: e.clientX,
        y: e.clientY,
      })
    }
  }

  function handleMouseUp() {
    isMouseDown.current = false
  }

  function bindWindowResizeEvent(remove?: boolean) {
    let funcName = 'addEventListener'
    if (remove) {
      funcName = 'removeEventListener'
    }
    window[funcName]('resize', handleResize, false)
  }

  function bindEvent(remove?: boolean) {
    let funcName = 'addEventListener'
    if (remove) {
      funcName = 'removeEventListener'
    }

    document[funcName]('click', handleMouseUp, false)
    document[funcName]('mousemove', handleMouseMove, false)
  }

  const imgClass = classnames(`${props.prefixCls}-image`, {
    drag: props.drag,
    [`${props.prefixCls}-image-transition`]: !isMouseDown.current,
  })

  const style = {
    zIndex: props.zIndex,
  }

  let imgNode = null

  // render
  const [totalPages, setTotalPages] = React.useState(0)
  const [pageNo, setPageNo] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [printing, setPrinting] = React.useState(false)
  const [content, setContent] = React.useState([])
  const loadSuccessSize = React.useRef(0)
  const nextLoadSuccessSize = React.useRef(0)
  const containerRef = React.useRef(null)

  React.useEffect(() => {
    if (!loading && printing) {
      if (totalPages > loadSuccessSize.current) {
        setPageNo(pageNo + 1)
      }
    }
  }, [loading])

  React.useEffect(() => {
    if (isPDF()) {
      // props.setPDFLoading(true);
      if (totalPages > 0) {
        loadNextPage()
      }
    }
  }, [pageNo, totalPages])

  React.useEffect(() => {
    if (printing && loadSuccessSize.current > 0) {
      if (totalPages > loadSuccessSize.current) {
        setPageNo(pageNo + 1)
      } else {
        reactToPrint()
        setPrinting(false)
      }
    }
  }, [printing])

  React.useImperativeHandle(
    printRef,
    () => ({
      toPrint,
    }),
    [containerRef.current],
  )

  const reactToPrint = useReactToPrint({
    content: () => containerRef.current,
  })

  function isPDF() {
    if (props.imgSrc && props.imgSrc.endsWith('.pdf')) {
      return true
    } else {
      return false
    }
  }

  function toPrint() {
    if (isPDF()) {
      setPrinting(true)
    } else {
      reactToPrint()
    }
  }

  function startLoading() {
    props.setPDFLoading(true)
    setLoading(true)
  }

  function endLoading() {
    setLoading(false)
    if (!printing) {
      props.setPDFLoading(false)
    }
  }

  function onRenderSuccess() {
    loadSuccessSize.current = loadSuccessSize.current + 1
    const nextSize = nextLoadSuccessSize.current
    if (pageNo === 0) {
      if (loadSuccessSize.current === nextSize) {
        endLoading()
      }
    } else {
      if (printing) {
        if (loadSuccessSize.current === nextSize) {
          endLoading()
        }
        if (loadSuccessSize.current === totalPages) {
          reactToPrint()
          setPrinting(false)
          setLoading(false)
          props.setPDFLoading(false)
        }
      } else {
        if (loadSuccessSize.current === nextSize || loadSuccessSize.current === totalPages) {
          endLoading()
        }
      }
    }
  }

  function onDocumentLoadSuccess({ numPages }) {
    setTotalPages(numPages)
    loadSuccessSize.current = 0
  }

  function loadNextPage() {
    let size: number
    let nextSize: number
    const currentSize = loadSuccessSize.current
    if (pageNo === 0) {
      size = 1
      nextSize = nextLoadSuccessSize.current = 1
    } else {
      if (printing) {
        size = printSize
      } else {
        size = pageSize
      }
      nextSize = nextLoadSuccessSize.current = currentSize + size
    }
    if (totalPages > currentSize) {
      const oldContent = content.slice()
      if (totalPages <= nextSize) {
        size = totalPages - currentSize
      }
      startLoading()
      setContent(
        oldContent.concat(
          new Array(size).fill('').map((_, index) => {
            return (
              <Page
                onRenderSuccess={onRenderSuccess}
                renderTextLayer={false}
                key={currentSize + index}
                pageNumber={currentSize + index + 1}
                style={{ display: 'none' }}
              />
            )
          }),
        ),
      )
    }
  }

  function onScrollHandler(e) {
    const { clientHeight, scrollTop, scrollHeight } = e.target
    // 3 屏加载下一页
    if (clientHeight + scrollTop >= scrollHeight) {
      const hasMore = totalPages > loadSuccessSize.current
      if (hasMore && !loading) {
        setPageNo(pageNo + 1)
        startLoading()
      }
    }
  }

  if (props.loading) {
    imgNode = (
      <div
        style={{
          display: 'flex',
          height: `${window.innerHeight - 84}px`,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Loading />
      </div>
    )
  } else {
    if (props.imgSrc !== '') {
      if (isPDF()) {
        const pdfStyle: React.CSSProperties = {
          width: '100%',
          height: '100%',
          overflow: loading || printing ? 'hidden' : 'auto',
        }
        imgNode = (
          <>
            {(printing || loading) && (
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '100%',
                  background: '#ccc',
                  position: 'absolute',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: props.zIndex,
                }}
              >
                <Loading />
              </div>
            )}
            <Document className={imgClass} file={props.imgSrc} options={options} onLoadSuccess={onDocumentLoadSuccess}>
              <div style={pdfStyle} onScroll={onScrollHandler}>
                <div ref={containerRef}>{content}</div>
              </div>
            </Document>
          </>
        )
      } else {
        const imgStyle: React.CSSProperties = {
          width: `${props.width}px`,
          height: `${props.height}px`,
          transform: `
    translateX(${props.left !== null ? props.left + 'px' : 'aoto'}) translateY(${props.top}px)
        rotate(${props.rotate}deg) scaleX(${props.scaleX}) scaleY(${props.scaleY})`,
        }

        let imgSrc = props.imgSrc

        if (props.imgSrc === 'changePdfFail') {
          imgSrc = FAILED
        }

        imgNode = (
          <div className='print-container' ref={containerRef}>
            <img className={imgClass} src={imgSrc} style={imgStyle} onMouseDown={handleMouseDown} />
          </div>
        )
      }
    }
  }

  return (
    <div className={`${props.prefixCls}-canvas`} onMouseDown={handleCanvasMouseDown} style={style}>
      {imgNode}
    </div>
  )
}

export default memo(forwardRef<ViewerRef, ViewerCanvasProps>(ViewerCanvas))
