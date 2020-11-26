// import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from 'constants';
import * as React from 'react';
import { ImageDecorator } from './ViewerProps';
const PDF = require('./pdf.png');
const FAILED = require('./failed.png');
const ArrowLeft = require('./arrow-left.png');
const ArrowRight = require('./arrow-right.png');

export interface ViewerNavProps {
  prefixCls: string;
  images: ImageDecorator[];
  activeIndex: number;
  navImgWidth?: number;
  onPreButton: (activeIndex: number) => Promise<number>;
  onNextButton: (activeIndex: number) => Promise<number>;
  onChangeImg: (index: number) => void;
}

export default function ViewerNav(props: ViewerNavProps) {
  const { navImgWidth = 100, activeIndex = 0 } = props;
  const initMarginValue = activeIndex > 5 ? - ( activeIndex - 5 ) * ( navImgWidth + 10 ) : 0;
  const [marginValue, setMarginValue] = React.useState(initMarginValue);
  const ulRef = React.useRef();
  const [showNext, setShowNext] = React.useState(false);
  const preActiveIndex = React.useRef(activeIndex);

  React.useEffect(() => {
    let ulContainer = ulRef.current || undefined;
    let ulWidth = ulContainer.clientWidth;
    const showNextButton = (navImgWidth + 10) * props.images.length + marginValue - 5 > ulWidth;
    if (showNextButton) {
      setShowNext(true);
    } else {
      setShowNext(false);
    }
  });

  // React.useEffect(() => {
  //   // 当前选中第6张，加载前20张
  //   if (activeIndex <= 5 && props.onPreButton) {
  //     props.onPreButton(activeIndex).then(length => {
  //       const pageOffset = length - props.images.length
  //       move(length, activeIndex + pageOffset)
  //     }).catch(() => {
  //       console.log('没有更多了')
  //     })
  //   }
  //   // 当前显示第15张,加载下一页20张
  //   if (activeIndex >= props.images.length - 6 && props.onNextButton) {
  //     props.onNextButton(activeIndex).then(length => {
  //       move(length)
  //     }).catch(() => {
  //       console.log('没有更多了')
  //     })
  //   }
  // }, [activeIndex]);
  // React.useEffect(() => {
  //   console.log('move')
  //   move()
  // }, [activeIndex])

  // React.useEffect(() => {
  //   fetchData(activeIndex);
  // }, []);

  React.useEffect(() => {
    console.log(preActiveIndex);
    fetchData(activeIndex);
    move();
    preActiveIndex.current = activeIndex;
  }, [activeIndex]);

  // function move(currentLength: number, activeIndey: number = activeIndex) {
  //   const itemOffset = navImgWidth + 10;
  //   let size = activeIndey - 2;
  //   const minSize = 0;
  //   const maxSize = currentLength - 6;
  //   if (size < minSize) {
  //     size = minSize;
  //   } else if (size > maxSize) {
  //     size = maxSize;
  //   }
  //   const currentValue = -size * itemOffset;
  //   if (currentValue !== marginValue) {
  //     setMarginValue(currentValue);
  //   }
  //   if (activeIndex !== activeIndey) {
  //     props.onChangeImg(activeIndey);
  //   }
  // }

  function move() {
    // 移动缩略图
    const itemOffset = navImgWidth + 10;
    const leftIndex = -marginValue / itemOffset;
    const rightIndex = leftIndex + 5;
    let currentValue = marginValue;
    if (activeIndex < preActiveIndex.current) {
      // 左移
      if (activeIndex === 0 && preActiveIndex.current === props.images.length - 1) {
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
      if (activeIndex === props.images.length - 1 && preActiveIndex.current === 0) {
        // 从第一张跳到最后一张
        currentValue = - (props.images.length - 5) * itemOffset;
      } else if (activeIndex === rightIndex + 1) {
        // 边界右移1
        currentValue -= itemOffset;
      } else if (activeIndex > rightIndex + 1) {
        currentValue = marginValue - (activeIndex - preActiveIndex.current) * itemOffset;
      }
    }
    // if (activeIndex <= leftIndex - 1) {
    //   // 左移
    //   currentValue += itemOffset;
    // } else if (activeIndex >= rightIndex + 1) {
    //   // 右移
    //   currentValue -= itemOffset;
    // }
    if (currentValue !== marginValue) {
      setMarginValue(currentValue);
    }
  }

  // function moveOne(activeIndey: number, offsetSize: number = 1) {
  //   const itemOffset = navImgWidth + 10;
  //   let currentValue = marginValue;
  //   if (activeIndey > activeIndex) {
  //     // 左移
  //     currentValue = marginValue - itemOffset * offsetSize;
  //   } else if (activeIndey < activeIndex) {
  //     // 右移
  //     currentValue = marginValue + itemOffset;
  //   }
  //   // 移动缩略图
  //   if (currentValue !== marginValue) {
  //     setMarginValue(currentValue);
  //   }
  //   // 移动activeIndex
  //   const leftIndex = -marginValue / itemOffset;
  //   const rightIndex = leftIndex + 5;
  //   // todo: 判断activeIndex
  //   if (leftIndex - 1 === activeIndey) {
  //     props.onChangeImg(activeIndey);
  //   } else if (leftIndex + 1 === activeIndey) {
  //     props.onChangeImg(activeIndey);
  //   } else if (rightIndex + 1 === activeIndey) {
  //     props.onChangeImg(activeIndey);
  //   } else if (rightIndex - 1 === activeIndey) {
  //     props.onChangeImg(activeIndey);
  //   }
  // }

  function fetchData(targetIndex: number) {
        // 当前选中第6张，加载前20张
    // let offsetSize = 1;
    // let prevLength = props.images.length;
    if (targetIndex <= 5 && props.onPreButton) {
      props.onPreButton(targetIndex).then(length => {
        // currentLength = length;
        // offsetSize = length - prevLength;
        targetIndex = length - props.images.length + targetIndex;
        // console.log(targetIndex, props.images.length, length);
      }).catch(() => {
        console.log('没有更多了');
        // offsetSize = targetIndex - activeIndex;
      }).finally(() => {
        // console.log(targetIndex, prevLength, props.images.length);
        // moveOne(targetIndex, offsetSize);
        props.onChangeImg(targetIndex);

        // moveOne(targetIndex);
      });
    } else if (targetIndex >= props.images.length - 6 && props.onNextButton) {
      // 当前显示第15张,加载下一页20张
      props.onNextButton(targetIndex).then(length => {
        // currentLength = length;
      }).catch(() => {
        console.log('没有更多了');
      }).finally(() => {
        // move(currentLength, targetIndex);
        // moveOne(targetIndex);
        props.onChangeImg(targetIndex);
      });
    } else {
      // 不需要加载数据的时候
      // move(props.images.length, targetIndex);
      // moveOne(targetIndex);
      props.onChangeImg(targetIndex);
    }
  }

  // React.useEffect(() => {
  //   const itemOffset = navImgWidth + 10
  //   let size = activeIndex - 2
  //   const minSize = 0
  //   const maxSize = props.images.length - 6
  //   if (size < minSize) {
  //     size = minSize
  //   } else if (size > maxSize) {
  //     size = maxSize
  //   }
  //   const currentValue = -size * itemOffset
  //   if (currentValue !== marginValue) {
  //     setMarginValue(currentValue)
  //   }
  // }, [activeIndex])

  function handleChangeImg(newIndex) {
    if (activeIndex === newIndex) {
      return;
    }
    props.onChangeImg(newIndex);
    // move(props.images.length, newIndex);
  }

  function goNext() {
    // let currentValue = marginValue - navImgWidth - 10;
    // setMarginValue(currentValue);
    if (activeIndex + 1 <= props.images.length) {
      fetchData(activeIndex + 1);
      // props.onChangeImg(activeIndex + 1);
    }
  }

  function goPre() {
    // let currentValue = marginValue + navImgWidth + 10;
    // setMarginValue(currentValue);
    if (activeIndex >= 1) {
      fetchData(activeIndex - 1);
      // props.onChangeImg(activeIndex - 1);
    }
  }

  let listStyle = {
    left: marginValue,
  };

  let liStyle = {
    width: navImgWidth,
  };

  return (
    <div className={`${props.prefixCls}-navbar divContainer`}>
      {
        marginValue ? <img src={ArrowLeft} alt="" className="preButton" onClick={() => goPre()}/> : <span className="preSpan"></span>
      }
      <div className="ulContainer" ref={ulRef} style={{margin: 'auto', width: (navImgWidth + 10) * props.images.length}}>
      <ul className={`${props.prefixCls}-list ${props.prefixCls}-list-transition`} style={listStyle}>
        {props.images.map((item, index) =>
          <li
          key={index}
          className={index === activeIndex ? 'active' : ''}
          style={liStyle}
          onClick={() => { handleChangeImg(index); }}
          >
            <img src={item.navSrc.endsWith('.pdf') ? PDF : item.navSrc || FAILED} alt={item.alt} style={{width: navImgWidth}}/>
          </li>,
          )
        }
        </ul>
      </div>
      {
        showNext ? <img src={ArrowRight} alt="" className="nextButton" onClick={() => goNext()}/> : <span className="nextSpan"></span>
      }
    </div>
  );
}
