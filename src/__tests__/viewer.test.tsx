import Viewer from '../index'
import ViewerProps, { ImageDecorator } from '../ViewerProps'
import { configure, mount } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import * as React from 'react'
import EventEmitter from 'wolfy87-eventemitter'
import img from '../../demo/images/image1.jpg'
import img2 from '../../demo/images/image2.jpg'

configure({ adapter: new Adapter() })

function $$(className) {
  return document.body.querySelectorAll(className)
}

interface ViewerTesterProps {
  hasContainer?: boolean
  onChangeImages?: () => ViewerProps['images']
}

interface ViewerTesterState {
  visible: boolean
  activeIndex: number
  images: ImageDecorator[]
}

class ViewerTester extends React.Component<ViewerTesterProps & ViewerProps, ViewerTesterState> {
  static defaultProps = {
    hasContainer: false,
  }

  container: HTMLElement

  constructor(props) {
    super(props)

    this.state = {
      visible: false,
      activeIndex: 0,
      images: props.images || [
        {
          navSrc: img,
          src: img,
          alt: 'lake',
          downloadUrl: '',
        },
        {
          navSrc: img2,
          src: img2,
          alt: 'mountain',
          downloadUrl: '',
        },
      ],
    }
  }

  handleOpen = () => {
    this.setState({
      visible: true,
    })
  }

  handleChangeActiveIndex = () => {
    this.setState({
      activeIndex: 1,
    })
  }

  handleChangeImages = () => {
    if (this.props.onChangeImages) {
      this.setState({
        images: this.props.onChangeImages(),
      })
    }
  }

  render() {
    const { hasContainer, ...viewerProps } = this.props

    return (
      <div>
        <button id='viewer-tester-open-btn' onClick={this.handleOpen}>
          open viewer
        </button>
        <button id='viewer-tester-change-btn' onClick={this.handleChangeActiveIndex}>
          change active index
        </button>
        <button id='viewer-tester-change-images-btn' onClick={this.handleChangeImages}>
          change images
        </button>
        <div
          id='container'
          ref={ref => {
            this.container = ref
          }}
          style={{ width: '150px', height: '150px' }}
        ></div>
        <Viewer
          visible={this.state.visible}
          images={this.state.images}
          activeIndex={this.state.activeIndex}
          container={hasContainer ? this.container : null}
          onClose={() => {
            this.setState({ visible: false })
          }}
          {...viewerProps}
        />
      </div>
    )
  }
}

const FAILED_IMG = 'fail_img'

let getImageSize = () => {
  return 100
}

function setGetImageSize(newFunc) {
  getImageSize = newFunc
}

class MockImage {
  source = ''
  width = 0
  height = 0
  ee = new EventEmitter()
  constructor() {
    this.ee.defineEvents(['load', 'error'])
  }

  get src() {
    return this.source
  }

  set src(value: string) {
    this.source = value
    this.width = this.height = getImageSize()
    if (this.source === FAILED_IMG) {
      this.ee.emitEvent('error')
    } else {
      this.ee.emitEvent('load')
    }
  }

  set onerror(ev) {
    this.ee.addListener('error', ev)
  }

  set onload(ev) {
    this.ee.addListener('load', ev)
  }

  addEventListener(event, callback) {
    this.ee.addListener(event, callback)
  }
}

declare const global: {
  Image
}

global.Image = MockImage

/** 触发鼠标拖动事件 */
function triggerMouseEvent(node, eventType, x = 0, y = 0) {
  const clickEvent = new MouseEvent(eventType, {
    clientX: x,
    clientY: y,
    view: window,
    bubbles: true,
    cancelable: true,
  })
  node.dispatchEvent(clickEvent)
}

/** 触发鼠标滚动 */
function triggerWheel(node, eventType, deltaY) {
  const wheelEvent = new WheelEvent(eventType, {
    view: window,
    bubbles: true,
    cancelable: true,
    deltaY,
  })
  node.dispatchEvent(wheelEvent)
}

/** 触发键盘操作事件 */
function triggerKeyboard(node, eventType, keyCode, ctrlKey = false) {
  const wheelEvent = new KeyboardEvent(eventType, {
    view: window,
    bubbles: true,
    cancelable: true,
    keyCode: keyCode,
    ctrlKey,
  } as unknown)
  node.dispatchEvent(wheelEvent)
}

/** 得到变换值 */
function getTransformValue(transform) {
  const translateXReg = /translateX\((.+)px\)(?= translateY)/
  const translateYReg = /translateY\((.+)px\)/
  const rotateReg = /rotate\((.+)deg\)/
  const scaleXReg = /scaleX\((.+)\) /
  const scaleYReg = /scaleY\((.+)\)/
  const translateX = transform.match(translateXReg)[1]
  const translateY = transform.match(translateYReg)[1]
  const rotate = transform.match(rotateReg)[1]
  const scaleX = transform.match(scaleXReg)[1]
  const scaleY = transform.match(scaleYReg)[1]
  return {
    translateX,
    translateY,
    rotate,
    scaleX,
    scaleY,
  }
}

jest.useFakeTimers()

let wrapper = null

interface ViewerHelperNewOptions extends ViewerProps, ViewerTesterProps {}

class ViewerHelper {
  new(props: ViewerHelperNewOptions = {}) {
    if (wrapper) {
      wrapper.unmount()
    }
    wrapper = mount(<ViewerTester {...props} />)
  }

  /**
   * 模拟点击打开事件
   */
  open() {
    wrapper.find('#viewer-tester-open-btn').simulate('click')
    this.skipAnimation()
  }

  skipAnimation() {
    jest.advanceTimersByTime(2000)
  }
}

const viewerHelper = new ViewerHelper()

describe('Viewer', () => {
  it('open and close', () => {
    viewerHelper.new()
    viewerHelper.open()

    expect($$('img.images-viewer-react-image')).toHaveLength(1)

    $$('.images-viewer-react-close')[0].click()

    viewerHelper.skipAnimation()

    wrapper.find('.images-viewer-react').simulate('transitionend')

    expect($$('.images-viewer-react')[0].style.display).toBe('none')
  })

  it('render with no footer', () => {
    viewerHelper.new({ noFooter: true })
    viewerHelper.open()

    expect($$('.images-viewer-react-footer')).toHaveLength(0)
  })

  it('render with no navbar', () => {
    viewerHelper.new({ noNavbar: true })
    viewerHelper.open()

    expect($$('.images-viewer-react-navbar')).toHaveLength(0)
  })

  it('render with no toolbar', () => {
    viewerHelper.new({ noToolbar: true })
    viewerHelper.open()

    expect($$('.images-viewer-react-toolbar')).toHaveLength(0)
  })

  it('render with no attribute', () => {
    viewerHelper.new({ attribute: false })
    viewerHelper.open()

    expect($$('.images-viewer-react-attribute')).toHaveLength(0)
  })

  it('render with no img details', () => {
    viewerHelper.new({ noImgDetails: true })
    viewerHelper.open()

    expect($$('.images-viewer-react-img-details')).toHaveLength(0)
  })

  it('render with no zoom rotate scale change toolbar button', () => {
    viewerHelper.new({
      zoomable: false,
      rotatable: false,
      scalable: false,
      changeable: false,
    })
    viewerHelper.open()

    expect($$('.images-viewer-react-icon-zoomIn')).toHaveLength(0)
    expect($$('.images-viewer-react-icon-zoomOut')).toHaveLength(0)
    expect($$('.images-viewer-react-icon-rotateLeft')).toHaveLength(0)
    expect($$('.images-viewer-react-icon-rotateRight')).toHaveLength(0)
    expect($$('.images-viewer-react-icon-scaleX')).toHaveLength(0)
    expect($$('.images-viewer-react-icon-scaleY')).toHaveLength(0)
    expect($$('.images-viewer-react-icon-prev')).toHaveLength(0)
    expect($$('.images-viewer-react-icon-next')).toHaveLength(0)
  })

  it('change active index success', () => {
    viewerHelper.new()
    viewerHelper.open()

    wrapper.find('#viewer-tester-change-btn').simulate('click')
    viewerHelper.skipAnimation()

    expect($$('.images-viewer-react-attribute')[0].innerHTML).toContain('mountain')
  })

  it('custom toolbar', () => {
    const handleClick = jest.fn()
    viewerHelper.new({
      customToolbar: toolbars => {
        return toolbars.concat([
          {
            key: 'test',
            render: <div id='c'>C</div>,
            onClick: handleClick,
          },
        ])
      },
    })
    viewerHelper.open()

    expect($$('li[data-key=test]')).toHaveLength(1)

    $$('li[data-key=test]')[0].click()

    expect(handleClick).toBeCalledWith(
      expect.objectContaining({
        alt: 'lake',
        downloadUrl: expect.anything(),
        src: expect.any(String),
      }),
    )
  })

  it('handle mask click', () => {
    const handleMaskClick = jest.fn()
    viewerHelper.new({
      onMaskClick: handleMaskClick,
    })
    viewerHelper.open()

    const canvas = $$('.images-viewer-react-canvas')[0]
    triggerMouseEvent(canvas, 'mousedown')

    expect(handleMaskClick).toBeCalledWith(expect.anything())
  })

  it('move image with mouse move', () => {
    viewerHelper.new()
    viewerHelper.open()

    const imgNode = $$('img.images-viewer-react-image')[0]

    const oldTransform = imgNode.style.transform

    const canvas = $$('.images-viewer-react-canvas')[0]
    triggerMouseEvent(canvas, 'mousedown')

    triggerMouseEvent(document, 'mousemove', 50, 50)

    viewerHelper.skipAnimation()

    const newTransform = imgNode.style.transform

    const oldTransformValue = getTransformValue(oldTransform)
    const newTransformValue = getTransformValue(newTransform)

    expect(newTransformValue.translateX - oldTransformValue.translateX).toBe(50)
    expect(newTransformValue.translateY - oldTransformValue.translateY).toBe(50)
  })

  it('change active image with prev and next button', () => {
    viewerHelper.new()
    viewerHelper.open()

    $$('li[data-key=next]')[0].click()
    $$('li[data-key=next]')[0].click()
    viewerHelper.skipAnimation()
    expect($$('.images-viewer-react-attribute')[0].innerHTML).toContain('lake')

    $$('li[data-key=prev]')[0].click()
    viewerHelper.skipAnimation()
    expect($$('.images-viewer-react-attribute')[0].innerHTML).toContain('mountain')
  })

  it('rotate image', () => {
    viewerHelper.new()
    viewerHelper.open()

    const imgNode = $$('img.images-viewer-react-image')[0]

    $$('li[data-key=rotateRight]')[0].click()

    expect(getTransformValue(imgNode.style.transform).rotate).toBe('90')

    $$('li[data-key=rotateLeft]')[0].click()

    expect(getTransformValue(imgNode.style.transform).rotate).toBe('0')
  })

  it('scale image', () => {
    viewerHelper.new()
    viewerHelper.open()

    const imgNode = $$('img.images-viewer-react-image')[0]

    $$('li[data-key=scaleX]')[0].click()

    expect(getTransformValue(imgNode.style.transform).scaleX).toBe('-1')

    $$('li[data-key=scaleY]')[0].click()

    expect(getTransformValue(imgNode.style.transform).scaleX).toBe('-1')
  })

  it('zoom image', () => {
    viewerHelper.new()
    viewerHelper.open()

    const imgNode = $$('img.images-viewer-react-image')[0]

    $$('li[data-key=zoomIn]')[0].click()

    expect(getTransformValue(imgNode.style.transform).scaleX).toBe('1.05')

    $$('li[data-key=zoomOut]')[0].click()

    expect(getTransformValue(imgNode.style.transform).scaleX).toBe('1')
  })

  it('mouse wheel', () => {
    viewerHelper.new()
    viewerHelper.open()

    const imgNode = $$('img.images-viewer-react-image')[0]

    const viewer = $$('.images-viewer-react')[0]

    triggerWheel(viewer, 'wheel', -1)

    viewerHelper.skipAnimation()

    expect(getTransformValue(imgNode.style.transform).scaleX).toBe('1')

    triggerWheel(viewer, 'wheel', 1)

    viewerHelper.skipAnimation()

    expect(getTransformValue(imgNode.style.transform).scaleX).toBe('1')
  })

  it('disable mouse wheel', () => {
    viewerHelper.new({
      disableMouseZoom: true,
    })
    viewerHelper.open()

    const imgNode = $$('img.images-viewer-react-image')[0]

    const viewer = $$('.images-viewer-react')[0]

    triggerWheel(viewer, 'wheel', -1)

    expect(getTransformValue(imgNode.style.transform).scaleX).toBe('1')
  })

  it('can not drag', () => {
    viewerHelper.new({
      drag: false,
    })
    viewerHelper.open()

    const imgNode = $$('img.images-viewer-react-image')[0]

    const oldTransform = imgNode.style.transform

    const canvas = $$('.images-viewer-react-canvas')[0]
    triggerMouseEvent(canvas, 'mousedown')

    triggerMouseEvent(canvas, 'mousemove', 50, 50)

    const newTransform = imgNode.style.transform

    const oldTransformValue = getTransformValue(oldTransform)
    const newTransformValue = getTransformValue(newTransform)

    expect(newTransformValue.translateX - oldTransformValue.translateX).toBe(0)
    expect(newTransformValue.translateY - oldTransformValue.translateY).toBe(0)
  })

  it('change active image with nav', () => {
    viewerHelper.new({})
    viewerHelper.open()

    const navList = $$('.images-viewer-react-list')[0]

    navList.children[1].click()

    viewerHelper.skipAnimation()

    expect($$('.images-viewer-react-attribute')[0].innerHTML).toContain('mountain')
  })

  it('render witch container', () => {
    viewerHelper.new({
      hasContainer: true,
    })

    viewerHelper.open()

    viewerHelper.skipAnimation()

    expect(wrapper.find('.images-viewer-react-inline')).toHaveLength(1)
  })

  it('reset image', () => {
    viewerHelper.new()
    viewerHelper.open()

    let imgNode = $$('img.images-viewer-react-image')[0]

    const oldTransformValue = getTransformValue(imgNode.style.transform)

    $$('li[data-key=zoomIn]')[0].click()
    $$('li[data-key=reset]')[0].click()

    imgNode = $$('img.images-viewer-react-image')[0]
    const newTransformValue = getTransformValue(imgNode.style.transform)

    expect(oldTransformValue.scaleX - newTransformValue.scaleX).toBe(0)
  })

  it('download', () => {
    viewerHelper.new({
      downloadable: true,
    })
    viewerHelper.open()

    $$('li[data-key=download]')[0].click()
  })

  it('keyboard support', () => {
    viewerHelper.new()
    viewerHelper.open()

    // close
    triggerKeyboard(document, 'keydown', 27)
    viewerHelper.skipAnimation()
    wrapper.find('.images-viewer-react').simulate('transitionend')
    expect($$('.images-viewer-react')[0].style.display).toBe('block')
    viewerHelper.open()

    // prev
    triggerKeyboard(document, 'keydown', 37)
    viewerHelper.skipAnimation()
    expect($$('.images-viewer-react-attribute')[0].innerHTML).toContain('lake')

    // next
    triggerKeyboard(document, 'keydown', 39)
    viewerHelper.skipAnimation()
    expect($$('.images-viewer-react-attribute')[0].innerHTML).toContain('lake')

    let imgNode = $$('img.images-viewer-react-image')[0]

    // zoomIn
    triggerKeyboard(document, 'keydown', 38)
    viewerHelper.skipAnimation()
    expect(getTransformValue(imgNode.style.transform).scaleX).toBe('1')

    // zoomOut
    triggerKeyboard(document, 'keydown', 40)
    viewerHelper.skipAnimation()
    expect(getTransformValue(imgNode.style.transform).scaleX).toBe('1')

    // rotateLeft
    triggerKeyboard(document, 'keydown', 37, true)
    viewerHelper.skipAnimation()
    expect(getTransformValue(imgNode.style.transform).rotate).toBe('0')

    // rotateRight
    triggerKeyboard(document, 'keydown', 39, true)
    viewerHelper.skipAnimation()
    expect(getTransformValue(imgNode.style.transform).rotate).toBe('0')

    // reset
    triggerKeyboard(document, 'keydown', 39, true)
    triggerKeyboard(document, 'keydown', 49, true)
    viewerHelper.skipAnimation()
    imgNode = $$('img.images-viewer-react-image')[0]
    expect(getTransformValue(imgNode.style.transform).rotate).toBe('0')
  })

  it('set default size', () => {
    viewerHelper.new({
      downloadable: true,
      defaultSize: {
        width: 100,
        height: 100,
      },
      images: [
        {
          navSrc: img,
          src: img,
          fileType: 'jpg',
          alt: 'lake',
          downloadUrl: '',
        },
        {
          navSrc: img2,
          src: img2,
          fileType: 'jpg',
          alt: 'mountain',
          downloadUrl: '',
          defaultSize: {
            width: 200,
            height: 200,
          },
        },
      ],
    })
    viewerHelper.open()

    let imgNode = $$('img.images-viewer-react-image')[0]
    expect(imgNode.style.width).toBe('100px')
    expect(imgNode.style.width).toBe('100px')

    $$('li[data-key=next]')[0].click()
    viewerHelper.skipAnimation()
    imgNode = $$('img.images-viewer-react-image')[0]
    expect(imgNode.style.width).toBe('200px')
    expect(imgNode.style.width).toBe('200px')
  })

  it('set defaultImg', () => {
    const defaultImg = 'deafult_img'

    viewerHelper.new({
      images: [
        {
          navSrc: FAILED_IMG,
          src: FAILED_IMG,
          fileType: 'jpg',
          alt: 'lake',
        },
        {
          navSrc: img2,
          src: img2,
          fileType: 'jpg',
          alt: 'mountain',
        },
      ],
      defaultImg: {
        navSrc: defaultImg,
        src: defaultImg,
        width: 100,
        height: 100,
      },
    })

    viewerHelper.open()

    const imgNode = $$('img.images-viewer-react-image')[0]
    expect(imgNode.src).toBe(`http://localhost/${defaultImg}`)
    expect(imgNode.style.width).toBe('100px')
    expect(imgNode.style.width).toBe('100px')
  })

  it('set defaultScale', () => {
    viewerHelper.new({
      images: [
        {
          navSrc: img,
          src: img,
          fileType: 'jpg',
          alt: 'lake',
          defaultSize: {
            width: 100,
            height: 100,
          },
        },
        {
          navSrc: img2,
          src: img2,
          fileType: 'jpg',
          alt: 'mountain',
        },
      ],
      defaultScale: 0.5,
    })

    viewerHelper.open()

    const imgNode = $$('img.images-viewer-react-image')[0]
    expect(imgNode.style.width).toBe('100px')
    expect(getTransformValue(imgNode.style.transform).scaleX).toBe('0.5')
  })

  it('set noLimitInitializationSize', () => {
    viewerHelper.new({
      defaultSize: {
        width: 2000,
        height: 2000,
      },
      images: [
        {
          navSrc: img,
          src: img,
          fileType: 'jpg',
          alt: 'lake',
          downloadUrl: '',
        },
        {
          navSrc: img2,
          src: img2,
          fileType: 'jpg',
          alt: 'mountain',
          downloadUrl: '',
        },
      ],
      noLimitInitializationSize: true,
    })
    viewerHelper.open()

    const imgNode = $$('img.images-viewer-react-image')[0]
    expect(imgNode.style.width).toBe('2000px')
    expect(imgNode.style.width).toBe('2000px')
  })

  it('set noResetZoomAfterChange', () => {
    viewerHelper.new({
      noResetZoomAfterChange: true,
    })
    viewerHelper.open()

    let imgNode = $$('img.images-viewer-react-image')[0]

    $$('li[data-key=zoomIn]')[0].click()
    viewerHelper.skipAnimation()
    expect(getTransformValue(imgNode.style.transform).scaleX).toBe('1.05')

    $$('li[data-key=next]')[0].click()
    viewerHelper.skipAnimation()
    imgNode = $$('img.images-viewer-react-image')[0]
    expect(getTransformValue(imgNode.style.transform).scaleX).toBe('1.05')
  })

  it('handle image change', () => {
    const handleImageChange = jest.fn()
    viewerHelper.new({
      onChange: handleImageChange,
    })
    viewerHelper.open()

    $$('li[data-key=next]')[0].click()

    expect(handleImageChange).toBeCalledWith(
      expect.objectContaining({
        alt: 'mountain',
        downloadUrl: '',
        src: expect.any(String),
      }),
      1,
    )
  })

  it('change image with no loop', () => {
    viewerHelper.new({
      loop: false,
    })
    viewerHelper.open()

    $$('li[data-key=next]')[0].click()
    $$('li[data-key=next]')[0].click()
    viewerHelper.skipAnimation()
    expect($$('.images-viewer-react-attribute')[0].innerHTML).toContain('mountain')

    $$('li[data-key=prev]')[0].click()
    $$('li[data-key=prev]')[0].click()
    viewerHelper.skipAnimation()
    expect($$('.images-viewer-react-attribute')[0].innerHTML).toContain('lake')

    // next
    triggerKeyboard(document, 'keydown', 39)
    triggerKeyboard(document, 'keydown', 39)
    viewerHelper.skipAnimation()
    expect($$('.images-viewer-react-attribute')[0].innerHTML).toContain('lake')

    // prev
    triggerKeyboard(document, 'keydown', 37)
    triggerKeyboard(document, 'keydown', 37)
    viewerHelper.skipAnimation()
    expect($$('.images-viewer-react-attribute')[0].innerHTML).toContain('lake')
  })

  it('customized CSS class', () => {
    viewerHelper.new({
      className: 'my-images-viewer-react',
    })
    viewerHelper.open()

    expect($$('.my-images-viewer-react')).toHaveLength(1)
  })

  it('showTotal', () => {
    viewerHelper.new({
      className: 'my-images-viewer-react',
    })
    viewerHelper.open()

    expect($$('.images-viewer-react-showTotal')[0].innerHTML).toBe('1 of 2')
    triggerKeyboard(document, 'keydown', 39)
    expect($$('.images-viewer-react-showTotal')[0].innerHTML).toBe('1 of 2')
  })

  it('max scale and min scale', () => {
    viewerHelper.new({
      className: 'my-images-viewer-react',
      maxScale: 1.06,
      minScale: 0.88,
    })
    viewerHelper.open()

    const imgNode = $$('img.images-viewer-react-image')[0]

    $$('li[data-key=zoomIn]')[0].click()
    $$('li[data-key=zoomIn]')[0].click()
    expect(getTransformValue(imgNode.style.transform).scaleX).toBe('1.06')
    $$('li[data-key=reset]')[0].click()
    $$('li[data-key=zoomOut]')[0].click()
    $$('li[data-key=zoomOut]')[0].click()
    $$('li[data-key=zoomOut]')[0].click()
    expect(getTransformValue(imgNode.style.transform).scaleX).toBe('0.88')
  })

  it('reset img when change images', () => {
    viewerHelper.new({
      images: [
        {
          navSrc: img,
          src: img,
          fileType: 'jpg',
          alt: 'lake',
        },
      ],
      onChangeImages: () => {
        return [
          {
            navSrc: img2,
            src: img2,
            fileType: 'jpg',
            alt: 'mountain',
          },
        ]
      },
    })

    viewerHelper.open()
    expect($$('.images-viewer-react-img-details')[0].innerHTML).toBe('(100 x 100)')
    setGetImageSize(() => 200)
    wrapper.find('#viewer-tester-change-images-btn').simulate('click')
    expect($$('.images-viewer-react-img-details')[0].innerHTML).toBe('(200 x 200)')
  })
})
