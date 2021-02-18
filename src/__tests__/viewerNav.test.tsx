import * as React from 'react'
import { configure, mount } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import ViewerNav from '../ViewerNav'
const img1 = require('../../demo/images/image1.jpg')
const img2 = require('../../demo/images/image2.jpg')
const img3 = require('../../demo/images/image3.jpg')
const img4 = require('../../demo/images/image4.jpg')
const img5 = require('../../demo/images/image5.jpg')
const img6 = require('../../demo/images/image6.jpg')
const img7 = require('../../demo/images/image7.jpg')

configure({ adapter: new Adapter() })

it('renders <ViewerNav /> components', () => {
  const prefixCls = 'images-viewer-react'
  const images = [
    {
      navSrc: img1,
      src: img1,
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
    {
      navSrc: img3,
      src: img3,
      fileType: 'jpg',
      alt: 'mountain',
      downloadUrl: '',
    },
    {
      navSrc: img4,
      src: img4,
      fileType: 'jpg',
      alt: 'mountain',
      downloadUrl: '',
    },
    {
      navSrc: img5,
      src: img5,
      fileType: 'jpg',
      alt: 'mountain',
      downloadUrl: '',
    },
    {
      navSrc: img6,
      src: img6,
      fileType: 'jpg',
      alt: 'mountain',
      downloadUrl: '',
    },
    {
      navSrc: img7,
      src: img7,
      fileType: 'jpg',
      alt: 'mountain',
      downloadUrl: '',
    },
  ]
  const activeIndex = 0
  const navImgWidth = 100
  const fn = jest.fn()
  const wrapper = mount(
    <ViewerNav
      prefixCls={prefixCls}
      images={images}
      activeIndex={activeIndex}
      onChangeImg={fn}
      onPreButton={fn}
      onNextButton={fn}
      navImgWidth={navImgWidth}
    />,
  )
  /** 点击下一张 */
  const nextButton = wrapper.find('.nextButton')
  expect(nextButton.text()).toBe('下一张')
  nextButton.simulate('click')
  const listClass = `.${prefixCls}-list-transition`
  expect(wrapper.find(listClass).prop('style')).toEqual({ left: -navImgWidth - 10 })
  nextButton.simulate('click')
  expect(wrapper.find(listClass).prop('style')).toEqual({ left: (-navImgWidth - 10) * 2 })

  /** 缩略图宽度 */
  expect(wrapper.find('li').at(0).prop('style')).toEqual({ width: navImgWidth })

  /** 点击上一张 */
  const preButton = wrapper.find('.preButton')
  expect(preButton.text()).toBe('上一张')
  preButton.simulate('click')
  expect(wrapper.find(listClass).prop('style')).toEqual({ left: -navImgWidth - 10 })
  preButton.simulate('click')
  expect(wrapper.find(listClass).prop('style')).toEqual({ left: 0 })

  /** 点击缩略图 */
  wrapper.find('li').at(0).simulate('click')
  expect(fn).toHaveBeenCalledTimes(0)
})
