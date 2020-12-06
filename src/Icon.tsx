import * as React from 'react';

export enum ActionType {
  zoomIn = 1,
  zoomOut = 2,
  prev = 3,
  next = 4,
  rotateLeft = 5,
  rotateRight = 6,
  reset = 7,
  close = 8,
  scaleX = 9,
  scaleY = 10,
  download = 11,
  print = 12,
}

export interface IconProps {
  type: ActionType;
}

export default function Icon(props: IconProps) {
  let prefixCls = 'images-viewer-react-icon';

  return (
    <i className={`${prefixCls} ${prefixCls}-${ActionType[props.type]}`}></i>
  );
}
