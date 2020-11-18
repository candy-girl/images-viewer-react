import * as React from 'react';
import { ImageDecorator } from './ViewerProps';
const PDF = require('./pdf.png');
const ArrowLeft = require('./arrow-left.png');
const ArrowRight = require('./arrow-right.png');

export interface ViewerNavProps {
  prefixCls: string;
  images: ImageDecorator[];
  activeIndex: number;
  navImgWidth?: number;
  onChangeImg: (index: number) => void;
}

export default function ViewerNav(props: ViewerNavProps) {
  const { activeIndex = 0, navImgWidth = 100 } = props;
  const [marginValue, setMarginValue] = React.useState(0);
  const ulRef = React.useRef();
  const [showNext, setShowNext] = React.useState(false);

  React.useEffect(() => {
    let ulContainer = ulRef.current || undefined;
    let ulWidth = ulContainer.clientWidth;
    const showNextButton = (navImgWidth + 10) * props.images.length + marginValue > ulWidth;
    if (showNextButton) {
      setShowNext(true);
    } else {
      setShowNext(false);
    }
  });

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
            <img src={item.src.endsWith('.pdf') ? PDF : item.src} alt={item.alt} style={{width: navImgWidth}}/>
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
