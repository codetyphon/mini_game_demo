// index.js
// 获取应用实例
const app = getApp()
const {
  load
} = require('../../utils/resloader')
const {
  stages
} = require('../../utils/stages')
Page({
  data: {
    score: 0,
    player: {
      x: 0,
      y: 0
    },
    stage_index: 0,
    map: []
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  on_progress(progress) {
    const {
      ctx,
      width,
      height,
    } = this.data

    //clear screen
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, width, height);

    //draw progress
    ctx.fillStyle = "#f00"
    ctx.fillRect(0, height / 2 - 2, progress * width, 4);
  },
  draw() {
    const {
      ctx,
      width,
      height,
      map,
      images
    } = this.data

    //clear screen
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, width, height);

    //draw player
    ctx.fillStyle = "#f00"

    const n = map.length
    const size = width / n

    console.log(n, size)

    map.forEach((line, y) => {
      line.forEach((item, x) => {
        if (item != 0) {
          ctx.drawImage(images.filter(img => {
            return img.id === item
          })[0].img, x * size, y * size, size, size)
        }
      })
    })
  },
  get_map(x, y) {
    const {
      map
    } = this.data
    return map[y][x]
  },
  set_map(x, y, value) {
    const {
      map
    } = this.data
    const new_map = [...map]
    new_map[y][x] = value
    this.setData({
      map: new_map
    })
  },
  find_player() {
    const {
      map
    } = this.data
    let at = null
    map.forEach((line, y) => {
      line.forEach((item, x) => {
        if (item == 8) {
          console.log('player at ', x, y)
          at = {
            x,
            y
          }
        }
      })
    })
    return at
  },
  up() {
    const {
      map
    } = this.data
    //find player 8
    const at = this.find_player()
    if (at) {
      const {
        x,
        y
      } = at
      this.move(8, [x, y], [x, y - 1])
    }
    this.draw()
  },
  down() {
    const {
      map
    } = this.data
    //find player 8
    const at = this.find_player()
    if (at) {
      const {
        x,
        y
      } = at
      console.log(x, y)
      this.move(8, [x, y], [x, y + 1])
    }
    this.draw()
  },
  left() {
    const {
      map
    } = this.data
    //find player 8
    const at = this.find_player()
    if (at) {
      const {
        x,
        y
      } = at
      this.move(8, [x, y], [x - 1, y])
    }
    this.draw()
  },
  right() {
    const {
      map
    } = this.data
    //find player 8
    const at = this.find_player()
    if (at) {
      const {
        x,
        y
      } = at
      this.move(8, [x, y], [x + 1, y])
    }
    this.draw()
  },
  move(id, from, to) {
    const _self = this
    const target = this.get_map(to[0], to[1])
    if (target == 0) {
      this.set_map(from[0], from[1], 0)
      this.set_map(to[0], to[1], id)
    }
    if (target == 2) {
      // next stage 
      const {
        stage_index
      } = this.data

      const next = stage_index + 1
      if (next < stages.length) {
        this.setData({
          stage_index: next,
          map: stages[next]
        })
      } else {
        // 通关
        wx.showModal({
          title: '提示',
          content: '你已经通关了，是否重新玩一局？',
          success(res) {
            if (res.confirm) {
              _self.setData({
                stage_index: 0,
                map: stages[0]
              })
              _self.draw()
            } else if (res.cancel) {

            }
          }
        })

      }
    }
  },
  start() {
    this.setData({
      map: stages[this.data.stage_index]
    })
    this.draw()
  },
  onReady() {
    const _self = this;
    const query = wx.createSelectorQuery()
    query.select('#myCanvas')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        console.log(res[0])

        const dpr = wx.getSystemInfoSync().pixelRatio
        // canvas.width = res[0].width * dpr
        // canvas.height = res[0].height * dpr
        const {
          width,
          height
        } = res[0]
        canvas.width = width
        canvas.height = height

        _self.setData({
          ctx: ctx,
          width: width,
          height: height,
          score: 0
        })

        // ctx.scale(dpr, dpr)
        load([1, 2, 8], canvas, (loaded_images) => {
          _self.setData({
            images: loaded_images
          })
          _self.start()
        }, (progress) => {
          _self.on_progress(progress)
        })
      })
  }
})