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
  handleMouseDown: (e) => void;
}

export interface PrintRef {
  toPrint: () => void;
}

const pageSize = 5;

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
};

const ViewerPDF = (props: ViewerPDFProps, printRef: React.MutableRefObject<PrintRef>) => {
  const [totalPages, setTotalPages] = React.useState(0);

  const [pageNo, setPageNo] = React.useState(0);

  const [printing, setPrinting] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const [content, setContent] = React.useState([]);

  const loadSuccessSize = React.useRef(0);

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
    if (printing) {
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

  const onRenderSuccess = ({ pageNumber }) => {
    loadSuccessSize.current = loadSuccessSize.current + 1;
    console.log(loadSuccessSize.current);
    console.log(`第${pageNumber}页已经加载完成`);
    if (loadSuccessSize.current === (pageNo + 1) * pageSize || loadSuccessSize.current === totalPages) {
      console.log(`${loadSuccessSize.current}页全部加载完成`);
    }
    if (loadSuccessSize.current === totalPages && printing) {
      reactToPrint();
      setPrinting(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    // setPageNo(1);
    setTotalPages(numPages);
    loadSuccessSize.current = 0;
    // let currentSize = numPages;
    // if (numPages > pageSize) {
    //   currentSize = pageSize;
    // }
    // setContent(new Array(currentSize).fill('').map((_, index) => {
    //   return <Page onRenderSuccess={onRenderSuccess} renderTextLayer={false} key={index} pageNumber={index + 1} style={{ display: 'none' }} />;
    // }));
  };

  const loadNextPage = () => {
    const currentSize = pageNo * pageSize;
    const nextSize = (pageNo + 1) * pageSize;
    if (totalPages > currentSize) {
      let size = pageSize;
      const oldContent = content.slice();
      if (totalPages <= nextSize) {
        size = totalPages - currentSize;
      }
      setContent(oldContent.concat(new Array(size).fill('').map((_, index) => {
        return <Page
          onRenderSuccess={onRenderSuccess}
          renderTextLayer={false}
          key={(currentSize) + index}
          pageNumber={(currentSize) + index + 1}
          style={{ display: 'none' }}
        />;
      })));
      setLoading(false);
    }
  };

  React.useEffect(() => {
    console.log(pageNo);
    if (totalPages > 0) {
      loadNextPage();
    }
    if (printing) {
      if (totalPages > pageNo * pageSize) {
        setPageNo(pageNo + 1);
        console.log('pageNo: ', pageNo);
      }
    }
  }, [pageNo, totalPages]);

  const onScrollHandler = (e) => {
    const { clientHeight, scrollTop, scrollHeight } = e.target;
    // 3 屏加载下一页
    if (clientHeight * 3 + scrollTop >= scrollHeight) {
      console.log('加载下一页');
      const hasMore = totalPages > loadSuccessSize.current;
      if (hasMore && !loading) {
        setPageNo(pageNo + 1);
        setLoading(true);
      }
    }
  };

  const imgClass = classnames(`${props.prefixCls}-image`, {
    drag: props.drag,
  });

  if (isPDF()) {
    return (
      <>
        {
          (printing || loading) && <div
            style={{
              display: 'flex',
              height: '100%',
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
          <div style={{ width: '100%', height: '100%', overflowY: 'scroll' }} onScroll={onScrollHandler}>
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
    let imgStyle: React.CSSProperties = {
      width: `${props.width}px`,
      height: `${props.height}px`,
      transform: `
  translateX(${props.left !== null ? props.left + 'px' : 'aoto'}) translateY(${props.top}px)
      rotate(${props.rotate}deg) scaleX(${props.scaleX}) scaleY(${props.scaleY})`,
    };

    return (
      <img
        ref={containerRef}
        className={imgClass}
        src={props.imgSrc}
        style={imgStyle}
        onMouseDown={props.handleMouseDown}
      />
    );
  }

};

export default React.forwardRef(ViewerPDF);
