import * as React from 'react';
import Loading from './Loading';
import classnames from 'classnames';
import { useReactToPrint } from 'react-to-print';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/umd/Page/AnnotationLayer.css';
import PdfjsWorker from './pdf.worker.entry';

pdfjs.GlobalWorkerOptions.workerPort = new PdfjsWorker();

export interface ViewerPDFProps {
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
  handleMouseDown: (e) => void;
  isMouseDown: React.MutableRefObject<boolean>;
}

export interface PrintRef {
  toPrint: () => void;
}

const pageSize = 5;
const printSize = 5;

const options = {
  // cMapUrl: 'cmaps/',
  cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
};

const ViewerPDF = (props: ViewerPDFProps, printRef: React.MutableRefObject<PrintRef>) => {
  const [totalPages, setTotalPages] = React.useState(1);

  const [pageNo, setPageNo] = React.useState(0);

  const [printing, setPrinting] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const [content, setContent] = React.useState([]);

  const loadSuccessSize = React.useRef(0);

  const nextLoadSuccessSize = React.useRef(0);

  const containerRef = React.useRef(null);

  const reactToPrint = useReactToPrint({
    content: () => containerRef.current,
  });

  const toPrint = () => {
    if (isPDF()) {
      setPrinting(true);
    } else {
      reactToPrint();
    }
  };

  React.useEffect(() => {
    if (printing && loadSuccessSize.current > 0) {
      if (totalPages > loadSuccessSize.current) {
        setPageNo(pageNo + 1);
      } else {
        reactToPrint();
        setPrinting(false);
      }
    }
  }, [printing]);

  React.useImperativeHandle(printRef, () => ({
    toPrint,
  }), [containerRef.current]);

  const isPDF = () => {
    if (props.imgSrc.endsWith('.pdf')) {
      return true;
    } else {
      return false;
    }
  };

  const startLoading = () => {
    props.setPDFLoading(true);
    setLoading(true);
  };

  const endLoading = () => {
    setLoading(false);
    if (!printing) {
      props.setPDFLoading(false);
    }
  };

  const onRenderSuccess = ({ pageNumber }) => {
    loadSuccessSize.current = loadSuccessSize.current + 1;
    // console.log(loadSuccessSize.current);
    // console.log(`第${pageNumber}页已经加载完成`);
    const nextSize = nextLoadSuccessSize.current;
    if (pageNo === 0) {
      if (loadSuccessSize.current === nextSize) {
        // console.log(`${loadSuccessSize.current}页全部加载完成`);
        endLoading();
      }
    } else {
      if (printing) {
        if (loadSuccessSize.current === nextSize) {
          // console.log(`${loadSuccessSize.current}页全部加载完成`);
          endLoading();
        }
        if (loadSuccessSize.current === totalPages) {
          // console.log('开始打印');
          reactToPrint();
          setPrinting(false);
          setLoading(false);
          props.setPDFLoading(false);
        }
      } else {
        if (loadSuccessSize.current === nextSize || loadSuccessSize.current === totalPages) {
          // console.log(`${loadSuccessSize.current}页全部加载完成`);
          endLoading();
        }
      }
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setTotalPages(numPages);
    loadSuccessSize.current = 0;
  };

  const loadNextPage = () => {
    let size;
    let nextSize;
    const currentSize = loadSuccessSize.current;
    if (pageNo === 0) {
      size = 1;
      nextSize = nextLoadSuccessSize.current = 1;
    } else {
      if (printing) {
        size = printSize;
      } else {
        size = pageSize;
      }
      nextSize = nextLoadSuccessSize.current = currentSize + size;
    }
    // console.log('loadSuccessSize:', loadSuccessSize.current);
    if (totalPages > currentSize) {
      const oldContent = content.slice();
      if (totalPages <= nextSize) {
        size = totalPages - currentSize;
      }
      startLoading();
      setContent(oldContent.concat(new Array(size).fill('').map((_, index) => {
        return <Page
          onRenderSuccess={onRenderSuccess}
          renderTextLayer={false}
          key={(currentSize) + index}
          pageNumber={(currentSize) + index + 1}
          style={{ display: 'none' }}
        />;
      })));
    }
  };

  React.useEffect(() => {
    if (!loading && printing) {
      if (totalPages > loadSuccessSize.current) {
        setPageNo(pageNo + 1);
      }
    }
  }, [loading]);

  React.useEffect(() => {
    if (isPDF()) {
      // props.setPDFLoading(true);
      if (totalPages > 0) {
        loadNextPage();
      }
    }
  }, [pageNo, totalPages]);

  const onScrollHandler = (e) => {
    const { clientHeight, scrollTop, scrollHeight } = e.target;
    // 3 屏加载下一页
    if (clientHeight + scrollTop >= scrollHeight) {
      // console.log('加载下一页');
      const hasMore = totalPages > loadSuccessSize.current;
      if (hasMore && !loading) {
        setPageNo(pageNo + 1);
        startLoading();
      }
    }
  };

  const imgClass = classnames(`${props.prefixCls}-image`, {
    drag: props.drag,
    [`${props.prefixCls}-image-transition`]: !props.isMouseDown.current,
  });

  if (isPDF()) {
    const pdfStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      overflow: (loading || printing) ? 'hidden' : 'auto',
    };
    return (
      <>
        {
          (printing || loading) && <div
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
        }
        <Document
          className={imgClass}
          file={props.imgSrc}
          options={options}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <div style={pdfStyle} onScroll={onScrollHandler}>
            <div ref={containerRef}>
              {
                content
              }
            </div>
          </div>
        </Document>
      </>
    );
  } else {
    const imgStyle: React.CSSProperties = {
      width: `${props.width}px`,
      height: `${props.height}px`,
      transform: `
  translateX(${props.left !== null ? props.left + 'px' : 'aoto'}) translateY(${props.top}px)
      rotate(${props.rotate}deg) scaleX(${props.scaleX}) scaleY(${props.scaleY})`,
    };

    return (
      <div className="print-container" ref={containerRef}>
        <img
          className={imgClass}
          src={props.imgSrc}
          style={imgStyle}
          onMouseDown={props.handleMouseDown}
        />
      </div>
    );
  }

};

export default React.forwardRef(ViewerPDF);
