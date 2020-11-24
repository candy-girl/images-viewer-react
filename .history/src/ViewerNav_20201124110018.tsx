import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from 'constants';
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
  onPreButton: () => void;
  onNextButton: () => void;
  onChangeImg: (index: number) => void;
}

export default function ViewerNav(props: ViewerNavProps) {
  const { activeIndex = 0, navImgWidth = 100 } = props;
  const initMarginValue = activeIndex > 5 ? - ( activeIndex - 5 ) * ( navImgWidth + 10 ) : 0;
  const [marginValue, setMarginValue] = React.useState(initMarginValue);
  const ulRef = React.useRef();
  const [showNext, setShowNext] = React.useState(false);

  React.useEffect(() => {
    let ulContainer = ulRef.current || undefined;
    let ulWidth = ulContainer.clientWidth;
    console.log(333, ulWidth)
    console.log(444, (navImgWidth + 10) * props.images.length + marginValue)
    const showNextButton = (navImgWidth + 10) * props.images.length + marginValue > ulWidth+10;
    if (showNextButton) {
      setShowNext(true);
    } else {
      setShowNext(false);
    }
  });

  React.useEffect(() => {
    if(marginValue<=5 * (navImgWidth + 10)){
      props.onPreButton();
    }
    if((props.images.length - 6) * (navImgWidth + 10) <= 5 * (navImgWidth + 10)){
      props.onNextButton();
    }
    console.log(123, activeIndex, initMarginValue)
  },[marginValue]);

  function handleChangeImg(newIndex) {
    if (activeIndex === newIndex) {
      return;
    }
    props.onChangeImg(newIndex);
  }

  function goNext() {
    let currentValue = marginValue - navImgWidth - 10;
    setMarginValue(currentValue);
  }

  function goPre() {
    let currentValue = marginValue + navImgWidth + 10;
    setMarginValue(currentValue);
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
