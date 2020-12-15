import * as React from 'react';
import Loading from './Loading';
import classnames from 'classnames';
// import { useReactToPrint } from 'react-to-print';
// import { Document, Page, pdfjs } from 'react-pdf';
// import 'react-pdf/dist/umd/Page/AnnotationLayer.css';
// import PdfjsWorker from './pdf.worker.entry';
import ViewerPDF from './ViewerPDF';
const FAILED = require('./images/failed.png');

// pdfjs.GlobalWorkerOptions.workerPort = new PdfjsWorker();

export interface ViewerCanvasProps {
  prefixCls: string;
  imgSrc: string;
  visible: boolean;
  width: number;
  height: number;
  top: number;
  left: number;
  rotate: number;
  onChangeImgState: (width: number, height: number, top: number, left: number) => void;
  onResize: () => void;
  zIndex: number;
  scaleX: number;
  scaleY: number;
  loading: boolean;
  drag: boolean;
  container: HTMLElement;
  setPDFLoading: (loading: boolean) => void;
  onCanvasMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export interface ViewerCanvasState {
  isMouseDown?: boolean;
  mouseX?: number;
  mouseY?: number;
}

const ViewerCanvas = (props: ViewerCanvasProps, printRef) => {

  const isMouseDown = React.useRef(false);
  const prePosition = React.useRef({
    x: 0,
    y: 0,
  });
  const [position, setPosition] = React.useState({
    x: 0,
    y: 0,
  });

  React.useEffect(() => {
    return () => {
      bindEvent(true);
      bindWindowResizeEvent(true);
    };
  }, []);

  React.useEffect(() => {
    bindWindowResizeEvent();

    return () => {
      bindWindowResizeEvent(true);
    };
  });

  React.useEffect(() => {
    if (props.visible && props.drag) {
      bindEvent();
    }
    if (!props.visible && props.drag) {
      handleMouseUp({});
    }
    return () => {
      bindEvent(true);
    };
  }, [props.drag, props.visible]);

  React.useEffect(() => {
    let diffX = position.x - prePosition.current.x;
    let diffY = position.y - prePosition.current.y;
    prePosition.current = {
      x: position.x,
      y: position.y,
    };
    props.onChangeImgState(props.width, props.height, props.top + diffY, props.left + diffX);
  }, [position]);

  function handleResize(e) {
    props.onResize();
  }

  function handleCanvasMouseDown(e) {
    props.onCanvasMouseDown(e);
    handleMouseDown(e);
  }

  function handleMouseDown(e) {
    if (e.button !== 0) {
      return;
    }
    if (!props.visible || !props.drag) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    isMouseDown.current = true;
    prePosition.current = {
      x: e.nativeEvent.clientX,
      y: e.nativeEvent.clientY,
    };
  }

  const handleMouseMove = (e) => {
    if (isMouseDown.current) {
      setPosition({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  function handleMouseUp(e) {
    isMouseDown.current = false;
  }

  function bindWindowResizeEvent(remove?: boolean) {
    let funcName = 'addEventListener';
    if (remove) {
      funcName = 'removeEventListener';
    }
    window[funcName]('resize', handleResize, false);
  }

  function bindEvent(remove?: boolean) {
    let funcName = 'addEventListener';
    if (remove) {
      funcName = 'removeEventListener';
    }

    document[funcName]('click', handleMouseUp, false);
    document[funcName]('mousemove', handleMouseMove, false);
  }

  let imgStyle: React.CSSProperties = {
    width: `${props.width}px`,
    height: `${props.height}px`,
    transform: `
translateX(${props.left !== null ? props.left + 'px' : 'aoto'}) translateY(${props.top}px)
    rotate(${props.rotate}deg) scaleX(${props.scaleX}) scaleY(${props.scaleY})`,
  };

  const imgClass = classnames(`${props.prefixCls}-image`, {
    drag: props.drag,
    [`${props.prefixCls}-image-transition`]: !isMouseDown.current,
  });

  let style = {
    zIndex: props.zIndex,
  };

  let imgNode = null;

  // const [totalPages, settotalPages] = React.useState(1);

  // const [pageNo, setPageNo] = React.useState(1);

  // const [content, setContent] = React.useState([]);

  // const loadSizeRef = React.useRef(0);
  // const containerRef = React.useRef(null);

  // const pageSize = 5;

  // const toPrint = useReactToPrint({
  //   content: () => containerRef.current,
  // });

  // const print = () => {
  //   console.log(containerRef.current);
  //   toPrint();
  // };

  // React.useImperativeHandle(printRef, () => ({
  //   ...containerRef.current,
  //   print,
  // }), []);

  // const onRenderSuccess = ({ pageNumber }) => {
  //   loadSizeRef.current = loadSizeRef.current + 1;
  //   console.log(loadSizeRef.current);
  //   console.log(`第${pageNumber}页已经加载完成`);
  //   if (loadSizeRef.current === pageNo * pageSize || loadSizeRef.current === totalPages) {
  //     console.log(`${loadSizeRef.current}全部加载完成`);
  //   }
  //   if (loadSizeRef.current === totalPages) {
  //     toPrint();
  //   }
  // };

  // const onDocumentLoadSuccess = ({ numPages }) => {
  //   setPageNo(1);
  //   settotalPages(numPages);
  //   loadSizeRef.current = 0;
  //   let currentSize = numPages;
  //   if (numPages > pageSize) {
  //     currentSize = pageSize;
  //   }
  //   setContent(new Array(currentSize).fill('').map((_, index) => {
  //       return <Page onRenderSuccess={onRenderSuccess} renderTextLayer={false} key={index} pageNumber={index + 1} style={{display: 'none'}} />;
  //   }));
  // };

  // const onScrollHandler = (e) => {
  //   const { clientHeight, scrollTop, scrollHeight } = e.target;
  //   // console.log(scrollTop);
  //   // console.log(clientHeight);
  //   // console.log(scrollHeight);
  //   // 3 屏加载下一页
  //   if (clientHeight * 3 + scrollTop >= scrollHeight) {
  //     console.log('触发');
  //     const size = pageNo * pageSize;
  //     if (totalPages > size) {
  //       let currentSize = pageSize;
  //       const oldContent = content.slice();
  //       if (totalPages <= size + pageSize) {
  //         currentSize = totalPages - size;
  //       }
  //       setContent(oldContent.concat(new Array(currentSize).fill('').map((_, index) => {
  //         return <Page onRenderSuccess={onRenderSuccess} renderTextLayer={false} key={(size) + index} pageNumber={(size) + index + 1} style={{ display: 'none' }} />;
  //       })));
  //       setPageNo(no => no + 1);
  //     }
  //   }
  // };

  // const options = {
  //   cMapUrl: 'cmaps/',
  //   cMapPacked: true,
  // };

  if (props.imgSrc !== '') {
    // props.imgSrc.endsWith('.pdf') ? imgNode = <ViewerPDF ref={containerRef} {...props} /> : imgNode = <img
    //   ref={containerRef}
    //   className={imgClass}
    //   src={props.imgSrc}
    //   style={imgStyle}
    //   onMouseDown={handleMouseDown}
    // />;
    if (props.imgSrc === 'changePdfFail') {
      imgNode = <img
      className={imgClass}
      src={FAILED}
      style={imgStyle}
      onMouseDown={handleMouseDown}
    />;
    } else {
      imgNode = <ViewerPDF ref={printRef} handleMouseDown={handleMouseDown} isMouseDown={isMouseDown} {...props} />;
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
    );
  }

  return (
    <div
      className={`${props.prefixCls}-canvas`}
      onMouseDown={handleCanvasMouseDown}
      style={style}
    >
      {imgNode}
    </div>
  );
};

export default React.forwardRef(ViewerCanvas);
