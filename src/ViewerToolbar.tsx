import React, { memo } from 'react'
import classnames from 'classnames'

import Icon, { ActionType } from './Icon'
import { ToolbarConfig } from './ViewerProps'

export interface ViewerToolbarProps {
  prefixCls: string
  onAction: (config: ToolbarConfig) => void
  alt: string
  width: number
  height: number
  attribute: boolean
  zoomable: boolean
  rotatable: boolean
  scalable: boolean
  changeable: boolean
  downloadable: boolean
  printable: boolean
  noImgDetails: boolean
  toolbars: ToolbarConfig[]
  activeIndex: number
  count: number
  showTotal: boolean
  loadingPDF?: boolean
}

export const defaultToolbars: ToolbarConfig[] = [
  {
    key: 'zoomIn',
    actionType: ActionType.zoomIn,
  },
  {
    key: 'zoomOut',
    actionType: ActionType.zoomOut,
  },
  {
    key: 'prev',
    actionType: ActionType.prev,
  },
  {
    key: 'reset',
    actionType: ActionType.reset,
  },
  {
    key: 'next',
    actionType: ActionType.next,
  },
  {
    key: 'rotateLeft',
    actionType: ActionType.rotateLeft,
  },
  {
    key: 'rotateRight',
    actionType: ActionType.rotateRight,
  },
  {
    key: 'scaleX',
    actionType: ActionType.scaleX,
  },
  {
    key: 'scaleY',
    actionType: ActionType.scaleY,
  },
  {
    key: 'download',
    actionType: ActionType.download,
  },
  {
    key: 'print',
    actionType: ActionType.print,
    render: <div>P</div>,
  },
]

function deleteToolbarFromKey(toolbars: ToolbarConfig[], keys: string[]) {
  const targetToolbar = toolbars.filter(item => keys.indexOf(item.key) < 0)

  return targetToolbar
}

const ViewerToolbar = (props: ViewerToolbarProps) => {
  function handleAction(config: ToolbarConfig) {
    props.onAction(config)
  }

  function renderAction(config: ToolbarConfig) {
    let content = null
    // default toolbar
    if (typeof ActionType[config.actionType] !== 'undefined') {
      content = <Icon type={config.actionType} />
    }
    // extra toolbar
    if (config.render) {
      content = config.render
    }
    const loading =
      (config.actionType === ActionType.prev ||
        config.actionType === ActionType.next ||
        config.actionType === ActionType.print) &&
      props.loadingPDF
    const title = props.loadingPDF ? '数据加载中，请稍后...' : ''

    return (
      <li
        key={config.key}
        title={title}
        className={classnames(`${props.prefixCls}-btn`, { disable: loading })}
        onClick={() => {
          handleAction(config)
        }}
        data-key={config.key}
      >
        {content}
      </li>
    )
  }
  const attributeNode = props.attribute ? (
    <p className={`${props.prefixCls}-attribute`}>
      {props.alt && `${props.alt}`}
      {props.noImgDetails || (
        <span className={`${props.prefixCls}-img-details`}>{`(${props.width} x ${props.height})`}</span>
      )}
      {props.showTotal && (
        <span className={`${props.prefixCls}-showTotal`}>{`${props.activeIndex + 1} of ${props.count}`}</span>
      )}
    </p>
  ) : null
  let toolbars = props.toolbars
  if (!props.zoomable) {
    toolbars = deleteToolbarFromKey(toolbars, ['zoomIn', 'zoomOut'])
  }
  if (!props.changeable) {
    toolbars = deleteToolbarFromKey(toolbars, ['prev', 'next'])
  }
  if (!props.rotatable) {
    toolbars = deleteToolbarFromKey(toolbars, ['rotateLeft', 'rotateRight'])
  }
  if (!props.scalable) {
    toolbars = deleteToolbarFromKey(toolbars, ['scaleX', 'scaleY'])
  }
  if (!props.downloadable) {
    toolbars = deleteToolbarFromKey(toolbars, ['download'])
  }
  if (!props.printable) {
    toolbars = deleteToolbarFromKey(toolbars, ['print'])
  }
  return (
    <div>
      {attributeNode}
      <ul className={`${props.prefixCls}-toolbar`}>
        {toolbars.map(item => {
          return renderAction(item)
        })}
      </ul>
    </div>
  )
}

export default memo(ViewerToolbar)
