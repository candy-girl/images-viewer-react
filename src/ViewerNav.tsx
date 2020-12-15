// import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from 'constants';
import * as React from 'react';
import classnames from 'classnames';
import { ImageDecorator } from './ViewerProps';
const PDF = require('./images/pdf@2x.png');
const LOADING = require('./images/loading.png');
const ArrowLeft = require('./images/arrow-left.png');
const ArrowRight = require('./images/arrow-right.png');
const EXCEL = require('./images/excel@2x.png');
const WORD = require('./images/word@2x.png');

export interface ViewerNavProps {
  prefixCls: string;
  images: ImageDecorator[];
  activeIndex: number;
  navImgWidth?: number;
  onPreButton: (activeIndex: number) => Promise<number>;
  onNextButton: (activeIndex: number) => Promise<number>;
  onChangeImg: (index: number) => void;
  loadingPDF?: boolean;
}

export default function ViewerNav(props: ViewerNavProps) {
  const { navImgWidth = 100, activeIndex = 0, images } = props;
  const initMarginValue = activeIndex > 5 ? - ( activeIndex - 5 ) * ( navImgWidth + 10 ) : 0;
  const [marginValue, setMarginValue] = React.useState(initMarginValue);
  const ulRef = React.useRef();
  const [showNext, setShowNext] = React.useState(false);
  const preActiveIndex = React.useRef(activeIndex);

  React.useEffect(() => {
    // 删除图片后的位移
    const initMarginValue = activeIndex > 5 ? - ( activeIndex - 5 ) * ( navImgWidth + 10 ) : 0;
    setMarginValue(initMarginValue)
    setTimeout(() => {
      let ulContainer = ulRef.current || undefined;
      let ulWidth = ulContainer.clientWidth;
      const showNextButton = (navImgWidth + 10) * images.length + marginValue - 5 > ulWidth;
      if (showNextButton) {
        setShowNext(true);
      } else {
        setShowNext(false);
      }
    }, 0);
  });

  React.useEffect(() => {
    fetchData(activeIndex);
    move();
    preActiveIndex.current = activeIndex;
  }, [activeIndex]);

  function move() {
    if (images.length <= 6) {
      return;
    }
    // 移动缩略图
    const itemOffset = navImgWidth + 10;
    const leftIndex = -marginValue / itemOffset;
    const rightIndex = leftIndex + 5;
    let currentValue = marginValue;
    if (activeIndex < preActiveIndex.current) {
      // 左移
      if (activeIndex === 0 && preActiveIndex.current === images.length - 1) {
        // 从最后一张跳到第一张
        currentValue = 0;
      } else if (activeIndex === leftIndex - 1) {
        // 在边界左移1
        currentValue += itemOffset;
      } else if (activeIndex < leftIndex - 1) {
        currentValue = marginValue - (activeIndex - preActiveIndex.current) * itemOffset;
      }
    } else if (activeIndex > preActiveIndex.current) {
      // 右移
      if (activeIndex === images.length - 1 && preActiveIndex.current === 0) {
        // 从第一张跳到最后一张
        currentValue = - (images.length - 5) * itemOffset;
      } else if (activeIndex === rightIndex + 1) {
        // 边界右移1
        currentValue -= itemOffset;
      } else if (activeIndex > rightIndex + 1) {
        currentValue = marginValue - (activeIndex - preActiveIndex.current) * itemOffset;
      }
    }
    if (currentValue !== marginValue) {
      setMarginValue(currentValue);
    }
  }

  function fetchData(targetIndex: number) {
    // 当前选中第6张，加载前20张
    if (targetIndex <= 5 && props.onPreButton) {
      props.onPreButton(targetIndex).then(length => {
        targetIndex = length - images.length + targetIndex;
      }).catch(() => {
        console.log('没有更多了');
      }).finally(() => {
        props.onChangeImg(targetIndex);
      });
    } else if (targetIndex >= images.length - 6 && props.onNextButton) {
      // 当前显示第15张,加载下一页20张
      props.onNextButton(targetIndex).then(length => {
      }).catch(() => {
        console.log('没有更多了');
      }).finally(() => {
        props.onChangeImg(targetIndex);
      });
    } else {
      // 不需要加载数据的时候
      props.onChangeImg(targetIndex);
    }
  }

  function handleChangeImg(newIndex) {
    if (activeIndex === newIndex || props.loadingPDF) {
      return;
    }
    props.onChangeImg(newIndex);
  }

  function goNext() {
    if (props.loadingPDF) {
      return;
    }
    if (activeIndex + 1 <= images.length) {
      fetchData(activeIndex + 1);
    }
  }

  function goPre() {
    if (props.loadingPDF) {
      return;
    }
    if (activeIndex >= 1) {
      fetchData(activeIndex - 1);
    }
  }

  let listStyle = {
    left: marginValue,
  };

  let liStyle = {
    width: navImgWidth,
  };

  const title = props.loadingPDF ? '数据加载中，请稍后...' : '';

  return (
    <div className={`${props.prefixCls}-navbar divContainer`}>
      {
        marginValue ? <img src={ArrowLeft} alt="" title={title} className={classnames('preButton', { disable: props.loadingPDF })} onClick={() => goPre()}/> : <span className="preSpan"></span>
      }
      <div className="ulContainer" ref={ulRef} style={{margin: 'auto', width: (navImgWidth + 10) * images.length}}>
      <ul className={`${props.prefixCls}-list ${props.prefixCls}-list-transition`} style={listStyle}>
        {images.map((item, index) =>
          <li
            key={index}
            title={title}
            className={classnames({active: index === activeIndex, disable: props.loadingPDF})}
            style={liStyle}
            onClick={() => { handleChangeImg(index); }}
          >
            <img src={
                item.fileType === 'pdf'
                  ? PDF : item.fileType === 'xls' || item.fileType === 'xlsx'
                    ? EXCEL : item.fileType === 'doc' || item.fileType === 'docx'
                    ? WORD : item.navSrc || LOADING} alt={item.alt}
            />
          </li>,
          )
        }
        </ul>
      </div>
      {
        showNext ? <img src={ArrowRight} alt="" title={title} className={classnames('nextButton', { disable: props.loadingPDF })} onClick={() => goNext()}/> : <span className="nextSpan"></span>
      }
    </div>
  );
}
