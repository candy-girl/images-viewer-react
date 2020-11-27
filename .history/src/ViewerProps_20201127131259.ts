export interface ViewerImageSize {
  width: number;
  height: number;
}

export interface ImageDecorator {
  navSrc: string;
  src: string;
  fileType: string;
  alt?: string;
  downloadUrl?: string;
  defaultSize?: ViewerImageSize;
}

export interface ToolbarConfig {
  key: string;
  actionType?: number;
  render?: React.ReactNode;
  onClick?: (activeImage: ImageDecorator) => void;
}

export interface ViewerDefaultImg {
  navSrc: string;
  src: string;
  width?: number;
  height?: number;
}

interface ViewerProps {
  /** viewer是否可见 */
  visible?: boolean;

  /** 点击关闭按钮的回调 */
  onClose?: () => void;

  /** 需要进行浏览的图片地址集合 */
  images?: ImageDecorator[];

  /** 缩略图的宽度 */
  navImgWidth?: number;

  /** 当前图像index */
  activeIndex?: number;

  /** 自定义viewer组件的z-index */
  zIndex?: number;

  /** viewer渲染的父节点，设置后开启inline mode */
  container?: HTMLElement;

  /** 图片是否可拖动 */
  drag?: boolean;

  /** 是否显示图片属性 */
  attribute?: boolean;

  /** 是否显示缩放按钮 */
  zoomable?: boolean;

  /** 是否显示旋转按钮 */
  rotatable?: boolean;

  /** 是否显示变换按钮 */
  scalable?: boolean;

  /** 当蒙版被点击时的回调函数 */
  onMaskClick?: (e: React.MouseEvent<HTMLDivElement>) => void;

  /** 是否显示下载按钮 */
  downloadable?: boolean;
  /** 图片是否可循环 */
  loop?: boolean;

  // 不显示管理按钮
  noClose?: boolean;

  // 不显示图片详情
  noImgDetails?: boolean;

  // 不显示导航条
  noNavbar?: boolean;

  // 不显示工具栏
  noToolbar?: boolean;

  // 不呈现页脚
  noFooter?: boolean;

  // 是否显示更改按钮
  changeable?: boolean;

  // 自定义工具栏
  customToolbar?: (toolbars: ToolbarConfig[]) => ToolbarConfig[];

  // 变焦速度
  zoomSpeed?: number;

  // 默认图片大小
  defaultSize?: ViewerImageSize;

  // 图片加载失败显示默认图片
  defaultImg?: ViewerDefaultImg;

  // 禁用键盘支持
  disableKeyboardSupport?: boolean;

  // 没有复位变焦后的图像变化
  noResetZoomAfterChange?: boolean;

  // 没有限制图像初始化大小
  noLimitInitializationSize?: boolean;

  // 默认的放大缩小倍数
  defaultScale?: number;

  // 当图片改变时回调
  onChange?: (activeImage: ImageDecorator, index: number) => void;

  // 点击上一张
  onPreButton?: (activeIndex: number) =>  Promise<number>;

  // 点击下一张
  onNextButton?: (activeIndex: number) =>  Promise<number>;

  // 禁用鼠标缩放
  disableMouseZoom?: boolean;

  // 是否在新窗口中下载
  downloadInNewWindow?: boolean;

  // 自定义样式名
  className?: string;

  // 是否显示总数和范围
  showTotal?: boolean;

  // 最大缩放
  maxScale?: number;

  // 最小缩放
  minScale?: number;
}

export default ViewerProps;
