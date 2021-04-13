# 多图/pdf 预览组件

[![NPM version][npm-image]][npm-url]

> react image viewers.

## 简介

因为需要支持图片和 pdf 的预览、放大、缩小、折叠、打印下载等功能，所以写了这个组件

## 安装

> react >= 16.8.0 | react-dom >= 16.8.0

```bash
npm install images-viewer-react --save
```

## 使用方法

```javascript
import * as React from 'react'
import Viewer from 'images-viewer-react'

function App() {
  const [visible, setVisible] = React.useState(false)

  return (
    <div>
      <button
        onClick={() => {
          setVisible(true)
        }}
      >
        show
      </button>
      <Viewer
        visible={visible}
        onClose={() => {
          setVisible(false)
        }}
        images={[{ src: '', alt: '' }]}
      />
    </div>
  )
}
```

## 参数

| props                     | type                                                                          | default | description                               | required |
| ------------------------- | ----------------------------------------------------------------------------- | ------- | ----------------------------------------- | -------- |
| visible                   | string                                                                        | false   | 是否显示                                  | true     |
| onClose                   | function                                                                      | -       | 关闭预览窗口函数                          | true     |
| images                    | [ImageDecorator](#imagedecorator)[]                                           | []      | 预览的图片数组                            | true     |
| activeIndex               | number                                                                        | 0       | 当前预览图片的 index                      | false    |
| zIndex                    | number                                                                        | 1000    | 预览图片的时候 zIndex                     | false    |
| container                 | HTMLElement                                                                   | null    | inline 模式的容器                         | false    |
| drag                      | boolean                                                                       | true    | 拖拽图片的回调                            | false    |
| attribute                 | boolean                                                                       | true    | 是否显示图片属性                          | false    |
| zoomable                  | boolean                                                                       | true    | 是否显示缩放按钮                          | false    |
| rotatable                 | boolean                                                                       | true    | 是否显示旋转按钮                          | false    |
| scalable                  | boolean                                                                       | true    | 是否显示缩放按钮                          | false    |
| onMaskClick               | (e) => void                                                                   | -       | 当蒙版被点击时的回调函数                  | false    |
| downloadable              | boolean                                                                       | false   | 是否显示下载按钮                          | false    |
| noClose                   | boolean                                                                       | false   | 是否隐藏关闭按钮                          | false    |
| noNavbar                  | boolean                                                                       | false   | 是否隐藏导航条                            | false    |
| noToolbar                 | boolean                                                                       | false   | 是否隐藏工具栏                            | false    |
| noImgDetails              | boolean                                                                       | false   | 是否隐藏图片详情(width/height)            | false    |
| noFooter                  | boolean                                                                       | false   | 是否隐藏不呈现页脚                        | false    |
| changeable                | boolean                                                                       | true    | 是否隐藏更改按钮                          | false    |
| customToolbar             | (defaultToolbarConfigs: [ToolbarConfig](#toolbarconfig)[]) => ToolbarConfig[] | -       | 自定义工具栏                              | false    |
| zoomSpeed                 | number                                                                        | 0.05    | 变焦速度                                  | false    |
| defaultSize               | [ViewerImageSize](#viewerimagesize)                                           | -       | 默认图片大小                              | false    |
| defaultImg                | [viewerdefaultimg](#viewerimagesize)                                          | -       | 如果图片加载失败显示的默认图片            | false    |
| disableKeyboardSupport    | boolean                                                                       | false   | 禁用键盘支持                              | false    |
| noResetZoomAfterChange    | boolean                                                                       | false   | 没有复位变焦后的图像变化                  | false    |
| noLimitInitializationSize | boolean                                                                       | false   | 没有限制图像初始化大小                    | false    |
| defaultScale              | number                                                                        | 1       | 默认的放大缩小倍数                        | false    |
| onChange                  | (activeImage: [ImageDecorator](#imagedecorator), index: number) => void       | -       | 当图片改变时回调的回调                    | false    |
| onPreButton               | () => void                                                                    | -       | 点击上一张(当 activeIndex<5>)             | false    |
| onNextButton              | () => void                                                                    | -       | 点击下一张(当 activeIndex>images.length-5 | false    |
| loop                      | boolean                                                                       | true    | 导航条是否允许图片可循环                  | false    |
| disableMouseZoom          | boolean                                                                       | false   | 是否禁用鼠标滚动缩放图片大小              | false    |
| downloadInNewWindow       | boolean                                                                       | false   | 是否在新窗口中下载                        | false    |
| className                 | string                                                                        | -       | 自定义样式名                              | false    |
| showTotal                 | boolean                                                                       | true    | 是否显示总数和范围                        | false    |
| maxScale                  | number                                                                        | -       | 最大缩放                                  | false    |
| minScale                  | number                                                                        | 0.1     | 最小缩放                                  | false    |

### 图片资源相关参数

| props       | type                                | default | description    | required |
| ----------- | ----------------------------------- | ------- | -------------- | -------- |
| src         | string                              | -       | 图片资源       | true     |
| alt         | string                              | -       | 图片描述       | false    |
| downloadUrl | string                              | -       | 图片下载的地址 | false    |
| defaultSize | [ViewerImageSize](#viewerimagesize) | -       | 图片大小       | false    |

### 预览图片的大小

| props  | type   | default | description | required |
| ------ | ------ | ------- | ----------- | -------- |
| width  | number | -       | 图片宽度    | true     |
| height | number | -       | 图片高度    | true     |

### 默认图片相关属性

| props  | type   | default | description | required |
| ------ | ------ | ------- | ----------- | -------- |
| src    | number | -       | 图片资源    | true     |
| width  | number | -       | 图片宽度    | false    |
| height | number | -       | 图片高度    | false    |

### 工具栏配置

| props   | type            | default | description        | required |
| ------- | --------------- | ------- | ------------------ | -------- |
| key     | string          | -       | 对应的 key         | true     |
| render  | React.ReactNode | -       | 工具 render 的内容 | false    |
| onClick | function        | -       | 点击时候的回调     | false    |

## 键盘按钮支持

- `Esc`: 关闭预览的视图.
- `←`: 查看上一张.
- `→`: 查看下一张.
- `↑`: 放大图片.
- `↓`: 缩小图片.
- `Ctrl + 1`: 重置图片或者 pdf 资源.
- `Ctrl + ←`: 图片左旋转.
- `Ctrl + →`: 图片又旋转.

## License

MIT

[npm-image]: https://badge.fury.io/js/images-viewer-react.svg
[npm-url]: https://npmjs.org/package/images-viewer-react
